import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

import { Command } from 'classes/base/command';

import { logger } from 'utility/logger';

/**
 * This is a simple example call command
 * It handles connecting and disconnecting two channels
 * This does work in guilds and DMs
 *
 * It is not reliable and should not be used in production
 * It is not optimized and does not handle errors properly
 * It is not using a database to store the calls or queue
 *
 * this can be extended to be able to send messages between the channels
 * that would require a database or a global store for the calls and queue
 * you can do that by simply using a database and listening to the on message event
 * be aware that a chat should has to be heavily moderated in order
 * to prevent awful content from being shared or breaking the TOS
 */

// Instead of using a set/map here, you should be using a global store to access this data in other places
const queue = new Set<string>();
const calls = new Map<string, string>();
// These variables are only used in utility functions below, they can be replaced easily

export default new Command({
  isDevelopment: true,
  builder: new SlashCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .setName('call')
    .setDescription('Connect to a random call')
    .addSubcommand((cmd) => cmd.setName('connect').setDescription('Connect to a random call'))
    .addSubcommand((cmd) => cmd.setName('hangup').setDescription('Disconnect from the current call or the queue'))
    .addSubcommand((cmd) => cmd.setName('friend').setDescription('Ask the other party to be your friend')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'connect') {
      await handleConnect(interaction);
    } else if (subcommand === 'hangup') {
      await handleDisconnect(interaction);
    } else if (subcommand === 'friend') {
      await handleFriend(interaction);
    }
  },
});

/**
 * Handles the connect subcommand
 * @param interaction The interaction object
 */
async function handleConnect(interaction: ChatInputCommandInteraction) {
  // Check if the channel is already in a call
  if (await isInCall(interaction.channelId)) {
    return interaction
      .reply({
        content: 'This channel is already in a call!',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }

  // Check if the channel is already in the queue
  if (await isInQueue(interaction.channelId)) {
    return interaction
      .reply({
        content: 'This channel is already in the queue!',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }

  // Check if another channel is already in the queue
  if ((await getQueueSize()) > 0) {
    const randomChannelId = await getRandomChannel(interaction.channelId);
    const randomChannel = await interaction.client.channels
      .fetch(randomChannelId)
      .catch((err) => logger.error({ err }, 'Failed to fetch channel'));
    if (!randomChannel || !randomChannel.isSendable()) {
      return interaction
        .reply({
          content: 'Failed to connect to a random channel.',
        })
        .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
    }
    // Remove the channel from the queue
    await removeFromQueue(randomChannelId);
    // Add the channel to the calls map
    await establishConnection(interaction.channelId, randomChannelId);
    // Send a message to the connected channel
    randomChannel
      .send({ content: `A connection has been established!` })
      .catch(() => {
        interaction
          .reply({
            content: 'Failed to send a message to the random channel.',
            flags: [MessageFlags.Ephemeral],
          })
          .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
        return;
      })
      .catch((err) => logger.error({ err, channelId: randomChannelId }, 'Failed to send message to channel'));
    // Send a message to the current channel
    return interaction
      .reply({
        content: `A connection has been established!`,
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  /**
   * We are here if no connected channel is in the queue
   */
  // Add the channel to the queue
  await addToQueue(interaction.channelId);
  await interaction
    .reply({
      content: 'Connecting to a call...',
    })
    .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
}

/**
 * Handles the hang up subcommand
 * @param interaction The interaction object
 */
async function handleDisconnect(interaction: ChatInputCommandInteraction) {
  // Check if the channel is in the queue
  if (await isInQueue(interaction.channelId)) {
    // Remove the channel from the queue
    await removeFromQueue(interaction.channelId);
    return interaction
      .reply({
        content: 'You have been removed from the queue.',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  // Check if the channel is in a call
  if (!(await isInCall(interaction.channelId))) {
    return interaction
      .reply({
        content: 'This channel is not in a call or the queue!',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  // Get the connected channel
  const otherChannelId = await getConnectedChannel(interaction.channelId);
  // Remove the connected channel from the calls map
  if (otherChannelId) {
    await removeFromCall(otherChannelId);
    // Send a message to the connected channel if possible
    const otherChannel = await interaction.client.channels
      .fetch(otherChannelId)
      .catch((err) => logger.error({ err, channelId: otherChannelId }, 'Failed to fetch channel'));
    if (otherChannel && otherChannel.isSendable()) {
      await otherChannel
        .send({ content: 'The other party hung up the call.' })
        .catch((err) => logger.error({ err, channelId: otherChannelId }, 'Failed to send message to channel'));
    }
  }
  // Remove the channel from the calls map
  await removeFromCall(interaction.channelId);
  await interaction
    .reply({
      content: 'You hung up the call.',
    })
    .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
}

/**
 * Handles the friend subcommand
 * @param interaction The interaction object
 */
async function handleFriend(interaction: ChatInputCommandInteraction) {
  // Check if the channel is in a call
  if (!isInCall(interaction.channelId)) {
    return interaction
      .reply({
        content: 'This channel is not in a call!',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  // Get the connected channel
  const otherChannelId = await getConnectedChannel(interaction.channelId);
  if (!otherChannelId) {
    return interaction
      .reply({
        content: 'Failed to get the connected channel.',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  const otherChannel = await interaction.client.channels
    .fetch(otherChannelId)
    .catch((err) => logger.error({ err, channelId: otherChannelId }, 'Failed to fetch channel'));
  if (!otherChannel || !otherChannel.isSendable()) {
    return interaction
      .reply({
        content: 'Failed to get the connected channel.',
        flags: [MessageFlags.Ephemeral],
      })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  // Send a message to the connected channel
  const sentMessage = await otherChannel
    .send({ content: `\`${interaction.user.username}\` wants you to add them!` })
    .catch((err) => logger.error({ err, channelId: otherChannelId }, 'Failed to send message to channel'));
  // Send a message to the current channel with the result
  await interaction
    .reply({
      content: sentMessage ? `The other party has been asked to add you!` : 'Failed to send a message to the connected channel.',
    })
    .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
}

/**
 * Utility functions below
 * These can easily be replaced with a global store like Redis or a database
 */

/**
 * Checks if a channel is in a call
 * @param channelId The ID of the channel to check
 * @returns true if the channel is in a call, false otherwise
 */
async function isInCall(channelId: string): Promise<boolean> {
  return calls.has(channelId);
}

/**
 * Checks if a channel is in the queue
 * @param channelId The ID of the channel to check
 * @returns true if the channel is in the queue, false otherwise
 */
async function isInQueue(channelId: string): Promise<boolean> {
  return queue.has(channelId);
}

/**
 * Gets the size of the queue
 * @returns The size of the queue
 */
async function getQueueSize(): Promise<number> {
  return queue.size;
}

/**
 * Gets a random channel from the queue
 * @param currentChannelId The ID of the current channel
 * @returns A random channel ID from the queue
 */
async function getRandomChannel(currentChannelId: string): Promise<string> {
  return Array.from(queue).filter((channelId) => channelId !== currentChannelId)[Math.floor(Math.random() * (queue.size - 1))];
}

/**
 * Removes a channel from the queue
 * @param channelId The ID of the channel to remove from the queue
 * @returns true if the channel was removed, false otherwise
 */
async function removeFromQueue(channelId: string): Promise<boolean> {
  return queue.delete(channelId);
}

/**
 * Removes a channel from the calls map
 * @param channelId The ID of the channel to remove from the calls map
 * @returns true if the channel was removed, false otherwise
 */
async function removeFromCall(channelId: string): Promise<boolean> {
  return calls.delete(channelId);
}

/**
 * Gets the connected channel for a given channel ID
 * @param channelId The ID of the channel to get the connected channel for
 * @returns The ID of the connected channel
 */
async function getConnectedChannel(channelId: string): Promise<string | undefined> {
  return calls.get(channelId);
}

/**
 * Establishes a connection between two channels
 * @param channelId1 The ID of the first channel
 * @param channelId2 The ID of the second channel
 */
async function establishConnection(channelId1: string, channelId2: string): Promise<void> {
  calls.set(channelId1, channelId2);
  calls.set(channelId2, channelId1);
}

/**
 * Adds a channel to the queue
 * @param channelId The ID of the channel to add to the queue
 * @returns the current queue
 */
async function addToQueue(channelId: string): Promise<Set<string>> {
  return queue.add(channelId);
}
