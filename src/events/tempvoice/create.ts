import {
  ActionRowBuilder,
  ChannelType,
  Colors,
  DangerButtonBuilder,
  EmbedBuilder,
  Events,
  OverwriteType,
  PermissionFlagsBits,
  SecondaryButtonBuilder,
} from 'discord.js';

import { Event } from 'classes/base/event';

import { createTempVoice, getTempVoiceConfigurationByGuildId } from 'database/tempvoice';

export default new Event({
  name: Events.VoiceStateUpdate,
  async execute(_client, _oldState, newState) {
    if (!newState.channelId || !newState.member) return;

    const existingConfig = await getTempVoiceConfigurationByGuildId(newState.guild.id);
    if (!existingConfig || newState.channelId !== existingConfig.voiceChannelId) return;

    const categoryChannel = await newState.guild.channels.fetch(existingConfig.categoryChannelId).catch(() => null);
    if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) return;

    const tempVoiceChannel = await newState.guild.channels
      .create({
        name: `${newState.member.displayName}`,
        type: ChannelType.GuildVoice,
        parent: categoryChannel.id,
        permissionOverwrites: [
          {
            id: newState.member.id,
            type: OverwriteType.Member,
            allow: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: newState.guild.roles.everyone.id,
            type: OverwriteType.Role,
            ...(existingConfig.publicByDefault
              ? {
                  allow: [
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.Speak,
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                  ],
                }
              : {
                  deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.SendMessages],
                  allow: [PermissionFlagsBits.ViewChannel],
                }),
          },
        ],
      })
      .catch((error) => {
        console.error('Error creating temporary voice channel:', error);
        return null;
      });

    if (!tempVoiceChannel) return;

    if (!newState.member.voice.channelId) {
      await tempVoiceChannel.delete('User disconnected during creation').catch(() => null);
      return;
    }

    try {
      await newState.setChannel(tempVoiceChannel);
    } catch (error) {
      console.error('Failed to move user to temporary voice channel:', error);
      await tempVoiceChannel.delete('Failed to move user').catch(() => null);
      return;
    }

    await createTempVoice(newState.guild.id, newState.member.id, tempVoiceChannel.id);

    const embed = new EmbedBuilder()
      .setTitle('Channel Controls')
      .setDescription(`Use the buttons below to customize your temporary voice channel.`)
      .setColor(Colors.Blue);

    const components = [
      new ActionRowBuilder().addComponents(
        new SecondaryButtonBuilder().setCustomId('tempvoice-rename').setLabel('Rename').setEmoji({ name: '✏️' }),
        new SecondaryButtonBuilder().setCustomId('tempvoice-limit').setLabel('User Limit').setEmoji({ name: '👥' }),
        new SecondaryButtonBuilder().setCustomId('tempvoice-access').setLabel('Access').setEmoji({ name: '🔒' }),
        new SecondaryButtonBuilder().setCustomId('tempvoice-visibility').setLabel('Visibility').setEmoji({ name: '👁️' }),
        new SecondaryButtonBuilder().setCustomId('tempvoice-invite').setLabel('Invite User').setEmoji({ name: '📨' }),
      ),
      new ActionRowBuilder().addComponents(
        new DangerButtonBuilder().setCustomId('tempvoice-ownership').setLabel('Transfer Ownership').setEmoji({ name: '🔑' }),
        new DangerButtonBuilder().setCustomId('tempvoice-kick').setLabel('Kick User').setEmoji({ name: '🚫' }),
        new DangerButtonBuilder().setCustomId('tempvoice-ban').setLabel('Ban User').setEmoji({ name: '⛔' }),
        new DangerButtonBuilder().setCustomId('tempvoice-unban').setLabel('Unban User').setEmoji({ name: '🛑' }),
        new DangerButtonBuilder().setCustomId('tempvoice-delete').setLabel('Delete Channel').setEmoji({ name: '🗑️' }),
      ),
    ];

    await tempVoiceChannel
      .send({
        content: `${newState.member}`,
        embeds: [embed],
        components,
      })
      .catch((err) => console.error('Failed to send control panel message:', err));
  },
});
