import { ApplicationIntegrationType, ChannelType, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Command, ModuleType } from 'classes/command';

import { availableChannelModel, connectionModel } from 'models/phone';

export default new Command({
  module: ModuleType.Fun,
  data: new SlashCommandBuilder()
    .setName('phone')
    .setDescription('Start a phone call with a random person')
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .addSubcommand((subcommand) => subcommand.setName('connect').setDescription('Connects you to another random caller'))
    .addSubcommand((subcommand) => subcommand.setName('hangup').setDescription('Disconnects you from the call')),
  async execute({ client, interaction }) {
    await interaction.deferReply();
    if (!interaction.inCachedGuild()) return;

    const { user, options, channelId } = interaction;
    const lng = await client.getUserLanguage(user.id);

    switch (options.getSubcommand()) {
      case 'connect':
        {
          // Check if this channel is already in a connection
          const existingConnection = await connectionModel
            .findOne({ $or: [{ channelIdOne: channelId }, { channelIdTwo: channelId }] })
            .lean()
            .exec();
          if (existingConnection) return interaction.editReply(t('phone.connect.already', { lng }));

          // Check for available channels
          const availablePhones = await availableChannelModel
            .find({ channelId: { $ne: channelId } })
            .lean()
            .exec();

          if (availablePhones.length > 0) {
            // Get random available phone call
            const randomIndex = Math.floor(Math.random() * availablePhones.length);
            const randomTarget = availablePhones[randomIndex];

            // Remove target channel from pool
            await availableChannelModel.deleteOne({ channelId: randomTarget.channelId }).lean().exec();
            // Save the connection
            await connectionModel.create({ channelIdOne: channelId, channelIdTwo: randomTarget.channelId });

            // Inform channel
            interaction.editReply(t('phone.connect.connected', { lng }));

            // Inform target channel
            const targetChannel = await client.channels.fetch(randomTarget.channelId).catch(() => {});
            if (!targetChannel || targetChannel.type !== ChannelType.GuildText) return;
            targetChannel.send(t('phone.connect.connected'));
          } else {
            // No available channels, add this channel to the pool
            await availableChannelModel.create({ channelId });
            interaction.editReply(t('phone.connect.waiting', { lng }));
          }
        }
        break;
      case 'hangup':
        {
          const availableChannel = await availableChannelModel.findOne({ channelId }).lean().exec();
          if (availableChannel) {
            await availableChannelModel.findByIdAndDelete(availableChannel._id);
            return interaction.editReply(t('phone.hangup.disconnecting', { lng }));
          }

          const existingConnection = await connectionModel
            .findOne({
              $or: [{ channelIdOne: channelId }, { channelIdTwo: channelId }],
            })
            .lean()
            .exec();
          if (!existingConnection) return interaction.editReply(t('phone.hangup.none', { lng }));

          // Find the connected channel ID
          const connectedChannelId = existingConnection.channelIdOne === channelId ? existingConnection.channelIdTwo : existingConnection.channelIdOne;
          // Remove the connection
          await connectionModel.deleteOne({ _id: existingConnection._id });

          // Inform channel
          interaction.editReply(t('phone.hangup.disconnecting', { lng }));

          // Inform the other channel
          const targetChannel = await client.channels.fetch(connectedChannelId).catch(() => {});
          if (!targetChannel || targetChannel.type !== ChannelType.GuildText) return;
          targetChannel.send(t('phone.hangup.disconnected'));
        }
        break;
    }
  },
});
