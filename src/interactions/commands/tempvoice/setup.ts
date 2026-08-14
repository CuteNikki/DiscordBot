import {
  ApplicationIntegrationType,
  channelMention,
  ChannelType,
  ChatInputCommandBuilder,
  Colors,
  ContainerBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
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
        return interaction.editReply({
          flags: [MessageFlags.IsComponentsV2],
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Red)
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('tempvoice.common.no-configuration', { lng }))),
          ],
        });
      }

      const voiceChannels = await getTempVoicesByGuildId(interaction.guildId);

      return interaction.editReply({
        flags: [MessageFlags.IsComponentsV2],
        components: [
          new ContainerBuilder()
            .setAccentColor(Colors.Blue)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('tempvoice.info.title', { lng })))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                [
                  t('tempvoice.info.category', { lng, categoryChannel: channelMention(config.categoryChannelId) }),
                  t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(config.voiceChannelId) }),
                  t('tempvoice.info.public-by-default', {
                    lng,
                    publicByDefault: t(`tempvoice.info.public-${config.publicByDefault}`, { lng }),
                  }),
                ].join('\n'),
              ),
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                [
                  t('tempvoice.info.active-channels', { lng, activeChannels: voiceChannels.length, count: voiceChannels.length }),
                  ...voiceChannels.map((vc) =>
                    t('tempvoice.info.active-channel-item', {
                      lng,
                      channel: channelMention(vc.channelId),
                      owner: userMention(vc.ownerId),
                    }),
                  ),
                ].join('\n'),
              ),
            ),
        ],
      });
    }

    if (subcommand === 'help') {
      return interaction.editReply({
        flags: [MessageFlags.IsComponentsV2],
        components: [
          new ContainerBuilder()
            .setAccentColor(Colors.Blue)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('tempvoice.help.title', { lng })))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                [
                  t('tempvoice.help.start', { lng }),
                  t('tempvoice.help.reset', { lng }),
                  t('tempvoice.help.info', { lng }),
                  t('tempvoice.help.help', { lng }),
                  t('tempvoice.help.managing-title', { lng }),
                  t('tempvoice.help.managing-description', { lng }),
                ].join('\n'),
              ),
            ),
        ],
      });
    }

    if (subcommand === 'start') {
      const categoryChannel = interaction.options.getChannel('category', true, [ChannelType.GuildCategory]);
      const voiceChannel = interaction.options.getChannel('voice-channel', true, [ChannelType.GuildVoice]);
      const publicByDefault = interaction.options.getBoolean('public-by-default') ?? true;

      const existingConfig = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (existingConfig) {
        await updateTempVoiceConfiguration(interaction.guildId, categoryChannel.id, voiceChannel.id, publicByDefault);
        return await interaction.editReply({
          flags: [MessageFlags.IsComponentsV2],
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Blue)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  t('tempvoice.start.updated-title', { lng }) + '\n' + t('tempvoice.start.updated-description', { lng }),
                ),
              )
              .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  [
                    t('tempvoice.start.previous', { lng }),
                    t('tempvoice.info.category', { lng, categoryChannel: channelMention(existingConfig.categoryChannelId) }),
                    t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(existingConfig.voiceChannelId) }),
                    t('tempvoice.info.public-by-default', {
                      lng,
                      publicByDefault: t(`tempvoice.info.public-${existingConfig.publicByDefault}`, { lng }),
                    }),
                  ].join('\n'),
                ),
              )
              .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  [
                    t('tempvoice.start.new', { lng }),
                    t('tempvoice.info.category', { lng, categoryChannel: channelMention(categoryChannel.id) }),
                    t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(voiceChannel.id) }),
                    t('tempvoice.info.public-by-default', {
                      lng,
                      publicByDefault: t(`tempvoice.info.public-${publicByDefault}`, { lng }),
                    }),
                  ].join('\n'),
                ),
              ),
          ],
        });
      } else {
        await createTempVoiceConfiguration(interaction.guildId, categoryChannel.id, voiceChannel.id, publicByDefault);
        return await interaction.editReply({
          flags: [MessageFlags.IsComponentsV2],
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Green)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  t('tempvoice.start.created-title', { lng }) + '\n' + t('tempvoice.start.created-description', { lng }),
                ),
              )
              .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  [
                    t('tempvoice.start.new', { lng }),
                    t('tempvoice.info.category', { lng, categoryChannel: channelMention(categoryChannel.id) }),
                    t('tempvoice.info.voice-channel', { lng, voiceChannel: channelMention(voiceChannel.id) }),
                    t('tempvoice.info.public-by-default', {
                      lng,
                      publicByDefault: t(`tempvoice.info.public-${publicByDefault}`, { lng }),
                    }),
                  ].join('\n'),
                ),
              ),
          ],
        });
      }
    }

    if (subcommand === 'reset') {
      const existingConfig = await getTempVoiceConfigurationByGuildId(interaction.guildId);

      if (!existingConfig) {
        return interaction.editReply({
          flags: [MessageFlags.IsComponentsV2],
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Red)
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('tempvoice.common.no-configuration', { lng }))),
          ],
        });
      }

      await deleteTempVoiceConfiguration(interaction.guildId);
      return await interaction.editReply({
        flags: [MessageFlags.IsComponentsV2],
        components: [
          new ContainerBuilder()
            .setAccentColor(Colors.Green)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('tempvoice.reset.success', { lng }))),
        ],
      });
    }

    return interaction.editReply({
      flags: [MessageFlags.IsComponentsV2],
      components: [
        new ContainerBuilder()
          .setAccentColor(Colors.Red)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('tempvoice.common.invalid-subcommand', { lng }))),
      ],
    });
  },
});
