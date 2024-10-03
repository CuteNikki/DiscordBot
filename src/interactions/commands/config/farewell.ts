import { ApplicationIntegrationType, ChannelType, EmbedBuilder, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Command, ModuleType } from 'classes/command';
import { CustomEmbedBuilder, getEmbed, isEmptyEmbed } from 'classes/custom-embed';

import { getGuildSettings, updateGuildSettings } from 'db/guild';

import { logger } from 'utils/logger';

export default new Command({
  module: ModuleType.Config,
  botPermissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setName('farewell')
    .setDescription('Leave messages for your server')
    .addSubcommand((cmd) =>
      cmd
        .setName('channel')
        .setDescription('The channel to send leave messages to')
        .addChannelOption((option) =>
          option.setName('channel').setDescription('Leave messages channel (leave empty to remove)').addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((cmd) => cmd.setName('message').setDescription('Configure the message that is sent on leave'))
    .addSubcommand((cmd) => cmd.setName('info').setDescription('Shows you the current settings and available placeholders'))
    .addSubcommand((cmd) => cmd.setName('enable').setDescription('Enable the farewell module'))
    .addSubcommand((cmd) => cmd.setName('disable').setDescription('Disable the farewell module')),
  async execute({ client, interaction, lng }) {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply();

    const { options, guild, user } = interaction;

    const config = await getGuildSettings(guild.id);

    switch (options.getSubcommand()) {
      case 'channel':
        {
          const channel = options.getChannel('channel', false, [ChannelType.GuildText]);

          if (!channel) {
            if (!config.farewell.channelId) {
              return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription(t('farewell.channel.invalid', { lng }))]
              });
            }
            await updateGuildSettings(guild.id, {
              $set: {
                ['farewell.channelId']: null
              }
            });

            return interaction.editReply({
              embeds: [new EmbedBuilder().setColor(client.colors.farewell).setDescription(t('farewell.channel.removed', { lng }))]
            });
          }

          await updateGuildSettings(guild.id, {
            $set: {
              ['farewell.channelId']: channel.id
            }
          });
          interaction.editReply({
            embeds: [new EmbedBuilder().setColor(client.colors.farewell).setDescription(t('farewell.channel.set', { lng, channel: channel.toString() }))]
          });
        }
        break;
      case 'message':
        {
          const customBuilder = new CustomEmbedBuilder({
            client,
            interaction,
            message: config.farewell.message
          });
          customBuilder.once('submit', async (msg) => {
            await updateGuildSettings(guild.id, {
              $set: {
                ['farewell.message']: msg
              }
            });
            interaction
              .editReply({
                embeds: [new EmbedBuilder().setColor(client.colors.farewell).setDescription(t('farewell.message.set', { lng }))],
                components: []
              })
              .catch((err) => logger.debug({ err }, 'Could not edit reply'));
          });
        }
        break;
      case 'info':
        {
          const embeds = [
            new EmbedBuilder().setColor(client.colors.farewell).addFields(
              { name: t('farewell.state.title', { lng }), value: config.farewell.enabled ? t('enabled', { lng }) : t('disabled', { lng }) },
              { name: t('farewell.channel.title', { lng }), value: config.farewell.channelId ? `<#${config.farewell.channelId}>` : t('none', { lng }) },
              {
                name: t('farewell.placeholders.title', { lng }),
                value: [
                  `{user} - ${user.toString()}`,
                  `{user.mention} - ${user.toString()}`,
                  `{user.username} - ${user.username}`,
                  `{user.id} - ${user.id}`,
                  `{user.avatar} - [URL](<${user.displayAvatarURL()}>)`,
                  '', // New line to separate user and server placeholders
                  `{server} - ${guild.name}`,
                  `{server.name} - ${guild.name}`,
                  `{server.id} - ${guild.id}`,
                  `{server.member_count} - ${guild.memberCount}`,
                  `{server.icon} - [URL](<${guild.iconURL()}>)`
                ].join('\n')
              }
            )
          ];

          if (!isEmptyEmbed(config.farewell.message.embed)) {
            embeds.push(getEmbed(user, guild, config.farewell.message.embed));
          }

          interaction.editReply({
            embeds
          });
        }
        break;
      case 'enable':
        {
          if (config.farewell.enabled) {
            return interaction.editReply({
              embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription(t('farewell.state.already-enabled', { lng }))]
            });
          }

          await updateGuildSettings(guild.id, {
            $set: {
              ['farewell.enabled']: true
            }
          });

          return interaction.editReply({
            embeds: [new EmbedBuilder().setColor(client.colors.farewell).setDescription(t('farewell.state.enabled', { lng }))]
          });
        }
        break;
      case 'disable': {
        if (!config.farewell.enabled) {
          return interaction.editReply({
            embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription(t('farewell.state.already-disabled', { lng }))]
          });
        }

        await updateGuildSettings(guild.id, {
          $set: {
            ['farewell.enabled']: false
          }
        });

        return interaction.editReply({
          embeds: [new EmbedBuilder().setColor(client.colors.farewell).setDescription(t('farewell.state.disabled', { lng }))]
        });
      }
    }
  }
});
