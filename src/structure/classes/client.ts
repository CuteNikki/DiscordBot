import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

import { use } from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';

import { type UpdateQuery } from 'mongoose';

import { clientModel, type ClientSettings } from 'models/client';
import { guildModel, type GuildSettings } from 'models/guild';
import { userModel, type UserData } from 'models/user';

import type { Button } from 'classes/button';
import type { Command } from 'classes/command';
import type { Modal } from 'classes/modal';
import type { Selection } from 'classes/selection';

import { loadButtons } from 'loaders/buttons';
import { loadCommands } from 'loaders/commands';
import { loadEvents } from 'loaders/events';
import { loadModals } from 'loaders/modals';
import { loadSelections } from 'loaders/selection';

import { initDatabase } from 'utils/database';
import { keys } from 'utils/keys';
import type { Level, LevelIdentifier } from 'utils/level';

export class DiscordClient extends Client {
  // Cluster used for sharding
  public cluster = new ClusterClient(this);

  // Collections for loading and running commands, buttons and modals
  public commands = new Collection<string, Command<any>>(); // Collection<commandName, commandData>
  public buttons = new Collection<string, Button>(); // Collection<customId, buttonOptions>
  public modals = new Collection<string, Modal>(); // Collection<customId, modalOptions>
  public selections = new Collection<string, Selection>(); // Collection<customId, selectionOptions>

  // Collection of cooldowns so commands cannot be spammed
  public cooldowns = new Collection<string, Collection<string, number>>(); // Collection<commandName, Collection<userId, timestamp>>

  // Collections for database (used as "cache")
  public settings = new Collection<string, ClientSettings>(); // Collection<applicationId, settings>
  public guildSettings = new Collection<string, GuildSettings>(); // Collection<guildId, settings>
  public guildLanguages = new Collection<string, string>(); // Collection<guildId, language>
  public userData = new Collection<string, UserData>(); // Collection<userId, data>
  public userLanguages = new Collection<string, string>(); // Collection<userId, language>
  public level = new Collection<LevelIdentifier, Level>(); // Collection<{guildId, userId}, {level, xp}>
  public levelWeekly = new Collection<LevelIdentifier, Level>(); // Collection<{guildId, userId}, {level, xp}>

  // List of all currently available languages
  public readonly supportedLanguages = ['en', 'de'];

  constructor() {
    super({
      shards: getInfo().SHARD_LIST,
      shardCount: getInfo().TOTAL_SHARDS,
      // Partials are a way to handle objects that may not have all their data available
      // By enabling partials, your bot can still process events involving these incomplete objects by fetching additional data when needed
      partials: [
        Partials.Reaction,
        Partials.Message,
        Partials.Channel,
        Partials.GuildScheduledEvent,
        Partials.GuildMember,
        Partials.ThreadMember,
        Partials.User,
      ],
      // Intents are a way to specify which events your bot should receive from the Discord gateway
      intents: [
        // !! Needed for guilds, channels, roles and messages !!
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,

        // !! Needed for guild log !!
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildScheduledEvents,

        // !! Needed to keep track of bans !!
        // Without this users will show up as banned after being unbanned
        GatewayIntentBits.GuildModeration,

        // !! Privileged intents !!
        // Some intents are considered "privileged" and require additional permissions or approval from Discord:
        GatewayIntentBits.GuildMembers, // !! Needed for welcome messages and guild log !!
        GatewayIntentBits.MessageContent, // !! Needed for fast-type game !!
        GatewayIntentBits.GuildPresences,
      ],
    });

    // Loading everything and logging in once everything is loaded
    Promise.allSettled([this.loadModules(), this.initTranslation(), initDatabase(this)]).then(() => {
      this.login(keys.DISCORD_BOT_TOKEN);
    });
  }

  private async loadModules() {
    await loadEvents(this);
    await loadCommands(this);
    await loadButtons(this);
    await loadModals(this);
    await loadSelections(this);
  }

  // We use i18next to translate messages into a user specified language
  private async initTranslation() {
    await use(i18nextFsBackend).init({
      // debug: true,
      preload: this.supportedLanguages,
      fallbackLng: this.supportedLanguages[0],
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: 'src/structure/locales/{{lng}}_{{ns}}.json',
      },
    });
  }

  public async getGuildSettings(guildId: string): Promise<GuildSettings> {
    // Return guild settings from collection if found
    const settingsInCollection = this.guildSettings.get(guildId);
    if (settingsInCollection) return settingsInCollection;

    // Getting guild settings from model and setting collection
    const settings = await guildModel.findOneAndUpdate({ guildId }, {}, { upsert: true, new: true }).lean().exec();
    this.guildSettings.set(guildId, settings);

    // Return settings
    return settings;
  }

  public async updateGuildSettings(guildId: string, query: UpdateQuery<GuildSettings>): Promise<GuildSettings> {
    // Update settings in model and setting collection
    const updatedSettings = await guildModel.findOneAndUpdate({ guildId }, query, { upsert: true, new: true }).lean().exec();
    this.guildSettings.set(guildId, updatedSettings);

    // Return updated settings
    return updatedSettings;
  }

  public async getGuildLanguage(guildId: string | null | undefined): Promise<string> {
    // Return default language if no valid userId is provided
    if (!guildId) return this.supportedLanguages[0];

    // Return language from language collection if found
    const languageInCollection = this.guildLanguages.get(guildId);
    if (languageInCollection) return languageInCollection;

    // Return language from guild settings collection if found
    const guildDataInCollection = this.guildSettings.get(guildId);
    if (guildDataInCollection && guildDataInCollection.language) {
      // Setting language collection and returning language
      this.guildLanguages.set(guildId, guildDataInCollection.language);
      return guildDataInCollection.language;
    }

    // Set language collection and return default language
    this.guildLanguages.set(guildId, this.supportedLanguages[0]);
    return this.supportedLanguages[0];
  }

  public async updateGuildLanguage(userId: string, language: string): Promise<string> {
    // If language is not supported, use the default language
    if (!this.supportedLanguages.includes(language)) language = this.supportedLanguages[0];

    // Update the guild data model and language collection
    await this.updateGuildSettings(userId, { $set: { language } });
    this.guildLanguages.set(userId, language);

    // Return language
    return language;
  }

  public async getUserLanguage(userId: string | null | undefined): Promise<string> {
    // Return default language if no valid userId is provided
    if (!userId) return this.supportedLanguages[0];

    // Return language from language collection if found
    const languageInCollection = this.userLanguages.get(userId);
    if (languageInCollection) return languageInCollection;

    // Return language from user collection if found
    const userDataInCollection = this.userData.get(userId);
    if (userDataInCollection && userDataInCollection.language) {
      // Setting language collection and returning language
      this.userLanguages.set(userId, userDataInCollection.language);
      return userDataInCollection.language;
    }

    // Return language from user model if found
    const userData = await userModel.findOne({ userId }, {}, { upsert: false });
    if (userData && userData.language) {
      // Setting language collection and returning language
      this.userLanguages.set(userId, userData.language);
      return userData.language;
    }

    // Set language collection and return default language
    this.userLanguages.set(userId, this.supportedLanguages[0]);
    return this.supportedLanguages[0];
  }

  public async updateUserLanguage(userId: string, language: string): Promise<string> {
    // If language is not supported, use the default language
    if (!this.supportedLanguages.includes(language)) language = this.supportedLanguages[0];

    // Update the user data model and language collection
    await this.updateUserData(userId, { $set: { language } });
    this.userLanguages.set(userId, language);

    // Return language
    return language;
  }

  public async getUserData(userId: string): Promise<UserData> {
    // Return user data from collection if found
    const userDataInCollection = this.userData.get(userId);
    if (userDataInCollection) return userDataInCollection;

    // Getting user data from model and setting collection
    const userData = await userModel.findOneAndUpdate({ userId }, {}, { upsert: true, new: true });
    this.userData.set(userId, userData);

    // Return user data
    return userData;
  }

  public async updateUserData(userId: string, query: UpdateQuery<UserData>): Promise<UserData> {
    // Updating user data in model and setting collection
    const updatedUserData = await userModel.findOneAndUpdate({ userId }, query, { upsert: true, new: true });
    this.userData.set(userId, updatedUserData);

    // Return updated user data
    return updatedUserData;
  }

  public async getClientSettings(applicationId: string): Promise<ClientSettings> {
    // Return client settings from collection if found
    const settingsInCollection = this.settings.get(applicationId);
    if (settingsInCollection) return settingsInCollection;

    // Get client settings from model and setting collection
    const settings = await clientModel.findOneAndUpdate({ applicationId }, {}, { upsert: true, new: true }).lean().exec();
    this.settings.set(applicationId, settings);

    // Return settings
    return settings;
  }

  public async updateClientSettings(applicationId: string, query: UpdateQuery<ClientSettings>): Promise<ClientSettings> {
    // Updating client settings in model and setting collection
    const updatedSettings = await clientModel.findOneAndUpdate({ applicationId }, query, { upsert: true, new: true }).lean().exec();
    this.settings.set(applicationId, updatedSettings);

    // Return updated settings
    return updatedSettings;
  }
}
