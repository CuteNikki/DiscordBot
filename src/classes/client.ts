import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';

import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';

import type { Button } from 'classes/button';
import type { Command } from 'classes/command';

import { loadButtons } from 'loaders/buttons';
import { loadCommands, registerCommands } from 'loaders/commands';
import { loadEvents } from 'loaders/events';

import { keys } from 'utils/keys';
import { logger } from 'utils/logger';

import { userModel } from 'models/user';

export class DiscordClient extends Client {
  commands = new Collection<string, Command>(); // Collection<commandName, commandData>
  buttons = new Collection<string, Button>(); // Collection<buttonName, buttonData>
  cooldowns = new Collection<string, Collection<string, number>>(); // Collection<commandName, Collection<userId, timestamp>>
  languages = new Collection<string, string>(); // Collection<userId, language>
  supportedLanguages = ['en', 'de'];

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds, // !! Needed for guilds, channels and roles !!
        // GatewayIntentBits.GuildModeration, // !! Needed to keep track of bans !!
        // (If a user gets banned and then unbanned they will still show up as banned in the cache without this intent)
        // privileged intents:
        // GatewayIntentBits.GuildMembers, // !! Needed for welcome messages !!
        GatewayIntentBits.GuildPresences, // !! Needed for userinfo !!
        // GatewayIntentBits.MessageContent // Not needed as we are not reading messages and only replying to interactions
      ],
    });

    // Connect to database
    mongoose
      .connect(keys.DATABASE_URI)
      .then(() => logger.info('Connected to database'))
      .catch((err) => logger.error('Could not connect to database', err));

    // Initialize i18next
    i18next.use(i18nextFsBackend).init({
      // debug: true,
      preload: this.supportedLanguages,
      fallbackLng: this.supportedLanguages[0],
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: 'src/locales/{{lng}}/{{ns}}.json',
      },
    });

    // Add user data to collections
    this.syncUsers();

    // Load all modules
    this.loadModules();

    // Login with token
    this.login(keys.DISCORD_BOT_TOKEN);
  }

  async loadModules() {
    loadEvents(this);
    loadButtons(this);
    // Make sure to load commands before trying to register them
    loadCommands(this).then(() => registerCommands(this));
  }

  async syncUsers() {
    // Get all user documents
    const users = await userModel.find().lean().exec();
    // Loop through users and fill collections
    for (const user of users) {
      this.languages.set(user.userId, user.language);
    }
    logger.info(`Synced ${users.length} users`);
  }

  // Get a users language preference
  getLanguage(userId: string | null) {
    return this.languages.get(userId || '') || 'en';
  }
}
