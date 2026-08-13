import { ChannelType, ChatInputCommandBuilder, PermissionsBitField } from 'discord.js';

import { Command } from 'classes/base/command';

import {
  createTempVoiceConfiguration,
  deleteTempVoiceConfiguration,
  getTempVoiceConfigurationByGuildId,
  getTempVoicesByGuildId,
  updateTempVoiceConfiguration,
} from 'database/tempvoice';

export default new Command({
  builder: new ChatInputCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setName('tempvoice-setup')
    .setDescription('A demonstration of temporary voice channels')
    .addSubcommands((cmd) =>
      cmd
        .setName('start')
        .setDescription('Setup temporary voice channels')
        .addChannelOptions((option) =>
          option
            .setName('category')
            .setDescription('The category to create temporary voice channels in')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory),
        )
        .addChannelOptions((option) =>
          option
            .setName('voice-channel')
            .setDescription('The voice channel users need to join to create temporary voice channels')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice),
        )
        .addBooleanOptions((option) =>
          option.setName('public-by-default').setDescription('Whether temporary voice channels are public by default').setRequired(false),
        ),
    )
    .addSubcommands((cmd) => cmd.setName('reset').setDescription('Deletes the temporary voice channel setup'))
    .addSubcommands((cmd) => cmd.setName('info').setDescription('Provides information about the temporary voice channel setup'))
    .addSubcommands((cmd) => cmd.setName('help').setDescription('Provides help for the temporary voice channel commands')),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'info') {
      const config = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (!config) {
        return interaction.editReply('No temporary voice channel configuration found for this server.');
      }

      const voiceChannels = await getTempVoicesByGuildId(interaction.guildId);

      return interaction.editReply(
        [
          'Temporary voice channel configuration:',
          `Category Channel ID: ${config.categoryChannelId}`,
          `Voice Channel ID: ${config.voiceChannelId}`,
          `Public By Default: ${config.publicByDefault}`,
          '',
          `Currently active channels: ${voiceChannels.length}`,
          ...voiceChannels.map((vc) => `- ${vc.channelId} (Owner: ${vc.ownerId})`),
        ].join('\n'),
      );
    }

    if (subcommand === 'help') {
      return interaction.editReply(
        [
          'Temporary Voice Channel Commands:',
          '`/tempvoice-setup start <category> <voice-channel> <public-by-default>` - Setup temporary voice channels.',
          '`/tempvoice-setup reset` - Reset the temporary voice channel setup.',
          '`/tempvoice-setup info` - Get information about the temporary voice channel setup.',
          '`/tempvoice-setup help` - Show this help message.',
        ].join('\n'),
      );
    }

    if (subcommand === 'start') {
      const categoryChannel = interaction.options.getChannel('category', true, [ChannelType.GuildCategory]);
      const voiceChannel = interaction.options.getChannel('voice-channel', true, [ChannelType.GuildVoice]);
      const publicByDefault = interaction.options.getBoolean('public-by-default') ?? true;

      const existingConfig = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (existingConfig) {
        await updateTempVoiceConfiguration(interaction.guildId, categoryChannel.id, voiceChannel.id, publicByDefault);
        return await interaction.editReply(
          [
            'Temporary voice channel configuration has been updated.',
            '',
            'Previous configuration:',
            `Category Channel ID: ${existingConfig.categoryChannelId}`,
            `Voice Channel ID: ${existingConfig.voiceChannelId}`,
            `Public By Default: ${existingConfig.publicByDefault}`,
            '',
            'New configuration:',
            `Category Channel ID: ${categoryChannel.id}`,
            `Voice Channel ID: ${voiceChannel.id}`,
            `Public By Default: ${publicByDefault}`,
          ].join('\n'),
        );
      } else {
        await createTempVoiceConfiguration(interaction.guildId, categoryChannel.id, voiceChannel.id, publicByDefault);
        return await interaction.editReply(
          [
            'Temporary voice channel configuration has been created.',
            '',
            `Category Channel ID: ${categoryChannel.id}`,
            `Voice Channel ID: ${voiceChannel.id}`,
            `Public By Default: ${publicByDefault}`,
          ].join('\n'),
        );
      }
    }

    if (subcommand === 'reset') {
      const existingConfig = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (!existingConfig) {
        return interaction.editReply('No temporary voice channel configuration found for this server.');
      }

      await deleteTempVoiceConfiguration(interaction.guildId);
      return await interaction.editReply('Temporary voice channel setup has been reset.');
    }

    return interaction.editReply('Invalid subcommand. Please use either `start`, `reset`, `info`, or `help`.');
  },
});
