import {
  ApplicationIntegrationType,
  channelMention,
  ChannelType,
  ChatInputCommandBuilder,
  InteractionContextType,
  PermissionsBitField,
  userMention,
} from 'discord.js';
import { t } from 'i18next';

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
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setName('tempvoice-setup')
    .setDescription('Setup temporary voice channels')
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

    const lng = interaction.locale;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'info') {
      const config = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (!config) {
        return interaction.editReply(t('tempvoice.common.no-configuration', { lng }));
      }

      const voiceChannels = await getTempVoicesByGuildId(interaction.guildId);

      return interaction.editReply(
        [
          t('tempvoice.info.title', { lng }),
          t('tempvoice.info.category', { lng, categoryChannel: channelMention(config.categoryChannelId) }),
          t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(config.voiceChannelId) }),
          t('tempvoice.info.public-by-default', { lng, publicByDefault: config.publicByDefault }),
          '',
          t('tempvoice.info.active-channels', { lng, activeChannels: voiceChannels.length }),
          ...voiceChannels.map((vc) =>
            t('tempvoice.info.active-channel-item', {
              lng,
              channel: channelMention(vc.channelId),
              owner: userMention(vc.ownerId),
            }),
          ),
        ].join('\n'),
      );
    }

    if (subcommand === 'help') {
      return interaction.editReply(
        [
          t('tempvoice.help.title', { lng }),
          t('tempvoice.help.start', { lng }),
          t('tempvoice.help.reset', { lng }),
          t('tempvoice.help.info', { lng }),
          t('tempvoice.help.help', { lng }),
          t('tempvoice.help.managing', { lng }),
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
            t('tempvoice.start.updated', { lng }),
            '',
            t('tempvoice.start.previous', { lng }),
            t('tempvoice.info.category', { lng, categoryChannel: channelMention(existingConfig.categoryChannelId) }),
            t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(existingConfig.voiceChannelId) }),
            t('tempvoice.info.public-by-default', { lng, publicByDefault: existingConfig.publicByDefault }),
            '',
            t('tempvoice.start.new', { lng }),
            t('tempvoice.info.category', { lng, categoryChannel: channelMention(categoryChannel.id) }),
            t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(voiceChannel.id) }),
            t('tempvoice.info.public-by-default', { lng, publicByDefault }),
          ].join('\n'),
        );
      } else {
        await createTempVoiceConfiguration(interaction.guildId, categoryChannel.id, voiceChannel.id, publicByDefault);
        return await interaction.editReply(
          [
            t('tempvoice.start.created', { lng }),
            '',
            t('tempvoice.info.category', { lng, categoryChannel: channelMention(categoryChannel.id) }),
            t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(voiceChannel.id) }),
            t('tempvoice.info.public-by-default', { lng, publicByDefault }),
          ].join('\n'),
        );
      }
    }

    if (subcommand === 'reset') {
      const existingConfig = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (!existingConfig) {
        return interaction.editReply(t('tempvoice.common.no-configuration', { lng }));
      }

      await deleteTempVoiceConfiguration(interaction.guildId);
      return await interaction.editReply(t('tempvoice.reset.success', { lng }));
    }

    return interaction.editReply(t('tempvoice.common.invalid-subcommand', { lng }));
  },
});
