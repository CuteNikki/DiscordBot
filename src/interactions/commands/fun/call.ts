import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  Client,
  Colors,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
  type SendableChannels,
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
  if (await isInCall(interaction.channelId)) {
    return replyEphemeral(interaction, 'This channel is already in a call!');
  }
  if (await isInQueue(interaction.channelId)) {
    return replyEphemeral(interaction, 'This channel is already in the queue!');
  }
  if ((await getQueueSize(interaction.channelId)) > 0) {
    const randomChannelId = await getRandomChannel(interaction.channelId);
    if (!randomChannelId) {
      return replyEphemeral(interaction, 'Failed to get a random channel.');
    }
    const randomChannel = await fetchSendableChannel(interaction.client, randomChannelId);
    if (!randomChannel) {
      return replyEphemeral(interaction, 'Failed to connect to a random channel.');
    }
    await removeFromQueue(randomChannelId);
    await establishConnection(interaction.channelId, randomChannelId);
    await sendSafely(randomChannel, 'A connection has been established!');
    return interaction
      .reply({ content: `A connection has been established!` })
      .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
  }
  await addToQueue(interaction.channelId);
  await replySafely(interaction, 'Connecting to a call...');
}

/**
 * Handles the hang up subcommand
 * @param interaction The interaction object
 */
async function handleDisconnect(interaction: ChatInputCommandInteraction) {
  if (await isInQueue(interaction.channelId)) {
    await removeFromQueue(interaction.channelId);
    return replyEphemeral(interaction, 'You have been removed from the queue.');
  }
  if (!(await isInCall(interaction.channelId))) {
    return replyEphemeral(interaction, 'This channel is not in a call or the queue!');
  }
  const otherChannelId = await getConnectedChannel(interaction.channelId);
  if (otherChannelId) {
    await removeFromCall(otherChannelId);
    const otherChannel = await fetchSendableChannel(interaction.client, otherChannelId);
    if (otherChannel) await sendSafely(otherChannel, `The other party hung up the call.`);
  }
  await removeFromCall(interaction.channelId);
  await replySafely(interaction, 'You hung up the call.');
}

/**
 * Handles the friend subcommand
 * @param interaction The interaction object
 */
async function handleFriend(interaction: ChatInputCommandInteraction) {
  if (!(await isInCall(interaction.channelId))) {
    return replyEphemeral(interaction, 'This channel is not in a call!');
  }
  const otherChannelId = await getConnectedChannel(interaction.channelId);
  if (!otherChannelId) {
    return replyEphemeral(interaction, 'Failed to get the connected channel.');
  }
  const otherChannel = await fetchSendableChannel(interaction.client, otherChannelId);
  if (!otherChannel) {
    return replyEphemeral(interaction, 'Failed to get the connected channel.');
  }
  const sentMessage = await sendSafely(otherChannel, `\`${interaction.user.username}\` wants you to add them!`);
  await replySafely(
    interaction,
    sentMessage ? `The other party has been asked to add you!` : 'Failed to send a message to the connected channel.',
  );
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
 * Helper to get all other channel IDs in the queue except the given one
 * @param excludeChannelId The channel ID to exclude
 * @returns Array of other channel IDs
 */
function getOtherQueueChannels(excludeChannelId?: string): string[] {
  return excludeChannelId ? Array.from(queue).filter((id) => id !== excludeChannelId) : Array.from(queue);
}

/**
 * Gets the size of the queue
 * @param currentChannelId The ID of the current channel
 * If provided, the current channel ID will be excluded from the queue size
 * @returns The size of the queue
 */
async function getQueueSize(currentChannelId?: string): Promise<number> {
  return getOtherQueueChannels(currentChannelId).length;
}

/**
 * Gets a random channel from the queue
 * @param currentChannelId The ID of the current channel
 * @returns A random channel ID from the queue
 */
async function getRandomChannel(currentChannelId: string): Promise<string | undefined> {
  const others = getOtherQueueChannels(currentChannelId);
  if (others.length === 0) return undefined;
  return others[Math.floor(Math.random() * others.length)];
}

/**
 * Removes a channel from the queue
 * @param channelId The ID of the channel to remove from the queue
 * @returns true if channel was removed, false otherwise
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
async function addToQueue(channelId: string): Promise<void> {
  queue.add(channelId);
}

/**
 * Helper to reply with an ephemeral error
 * @param interaction The interaction object
 * @param content The content of the reply
 */
async function replyEphemeral(interaction: ChatInputCommandInteraction, content: string) {
  return await interaction
    .reply({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(content)], flags: [MessageFlags.Ephemeral] })
    .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
}

/**
 * Helper to reply to an interaction safely
 * @param interaction The interaction object
 * @param content The content of the reply
 * @returns The reply promise
 */
async function replySafely(interaction: ChatInputCommandInteraction, content: string) {
  return await interaction
    .reply({ content, flags: [MessageFlags.Ephemeral] })
    .catch((err) => logger.error({ err }, 'Failed to reply to interaction'));
}

/**
 * Helper to fetch a sendable channel
 * @param client The client object
 * @param channelId The ID of the channel to fetch
 * @returns The sendable channel object or undefined
 */
async function fetchSendableChannel(client: Client, channelId: string) {
  const channel = await client.channels
    .fetch(channelId)
    .catch((err: unknown) => logger.error({ err, channelId }, 'Failed to fetch channel'));
  return channel && channel.isSendable() ? channel : undefined;
}

/**
 * Helper to send a message to a channel
 * @param channel The channel to send the message to
 * @param content The content of the message
 * @returns The sent message or undefined
 */
async function sendSafely(channel: SendableChannels, content: string) {
  return await channel
    .send({ content })
    .catch((err: unknown) => logger.error({ err, channelId: channel.id }, 'Failed to send message to channel'));
}
