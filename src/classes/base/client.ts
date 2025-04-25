import { ApplicationEmoji, Client, Collection } from 'discord.js';

import type { Button } from 'classes/base/button';
import type { Command } from 'classes/base/command';
import type { Modal } from 'classes/base/modal';
import type { SelectMenu } from 'classes/base/select';
import { ClusterClient } from 'discord-hybrid-sharding';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commands = new Collection<string, Command<any>>();
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
}
