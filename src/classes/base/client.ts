import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { ApplicationEmoji, AuditLogEvent, Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { performance } from 'perf_hooks';

import type { AuditLog } from 'classes/base/auditLog';
import type { Button } from 'classes/base/button';
import type { Command } from 'classes/base/command';
import type { Modal } from 'classes/base/modal';
import type { SelectMenu } from 'classes/base/select';

import { prisma } from 'database/index';

import { startCron } from 'utility/cron';
import { KEYS } from 'utility/keys';
import { logger } from 'utility/logger';
import { initializeI18N } from 'utility/translation';

import { loadAuditLogs } from 'loaders/auditLog';
import { loadButtons } from 'loaders/button';
import { loadCommands } from 'loaders/command';
import { loadEvents } from 'loaders/event';
import { loadModals } from 'loaders/modal';
import { loadSelectMenus } from 'loaders/select';

/**
 * ExtendedClient class that extends the Discord.js Client class.
 * This class includes a collection of commands.
 *
 * @extends {Client}
 */
export class ExtendedClient extends Client {
  /**
   * Cluster client.
   */
  cluster = new ClusterClient(this);

  /**
   * Collection of commands.
   * Collection<commandName, Command>
   */
  commands = new Collection<string, Command<unknown>>();

  /**
   * Audit logs collection.
   * Collection<AuditLogEvent, AuditLog>
   */
  auditLogs = new Collection<AuditLogEvent, AuditLog>();

  /**
   * Cooldowns collection.
   * Collection<commandName, Collection<userId, removeTimestamp>>
   */
  cooldowns = new Collection<string, Collection<string, number>>();

  /**
   * Buttons collection.
   * Collection<customId, Button>
   */
  buttons = new Collection<string, Button>();

  /**
   * Modals collection.
   * Collection<customId, Modal>
   */
  modals = new Collection<string, Modal>();

  /**
   * SelectMenu Collection.
   * Collection<customId, SelectMenu>
   */
  selectMenus = new Collection<string, SelectMenu>();

  /**
   * Custom emojis
   * This is a map of emoji names to their string representation.
   * For example: { "emojiName": "<:emojiName:emojiId>" }
   * This is used to store custom emojis that are fetched from the Discord API.
   * The emojis are fetched in src/events/client/ready.ts on client ready.
   */
  customEmojis: {
    [key: string]: ApplicationEmoji;
  } = {};

  /**
   * Constructor for ExtendedClient.
   * @param options - Client options.
   */
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Reaction],
      ws: {
        shardCount: getInfo().TOTAL_SHARDS,
        shardIds: getInfo().SHARD_LIST,
      },
    });
    this.initialize();
  }

  /**
   * Initialize the client.
   */
  private async initialize() {
    const startTime = performance.now();

    // Running all of this in parallel
    await Promise.all([
      prisma.$connect(),
      initializeI18N(),
      startCron(),
      loadCommands(this),
      loadEvents(this),
      loadAuditLogs(this),
      loadButtons(this),
      loadModals(this),
      loadSelectMenus(this),
    ]);

    const endTime = performance.now();
    logger.info(`Loaded everything in ${Math.floor(endTime - startTime)}ms!`);

    await this.login(KEYS.DISCORD_BOT_TOKEN);
  }
}
