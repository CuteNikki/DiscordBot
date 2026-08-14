import { ActionRowBuilder, EmbedBuilder, LinkButtonBuilder, MessageFlags, userMention } from 'discord.js';
import { t } from 'i18next';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { Modal } from 'classes/base/modal';

import { setVoiceChannelAccess } from 'utility/tempvoice';

const recentInvitesCache = new Set<string>();
const TEN_MINUTES_MS = 10 * 60 * 1000;

export default new Modal({
  customId: 'tempvoice-invite',
  async execute(interaction) {
    if (!interaction.inCachedGuild() || !interaction.channel) return;
    const lng = interaction.locale;

    if (!interaction.channel.isVoiceBased()) {
      return interaction.reply({
        content: t('tempvoice.common.no-voice-channel', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const tempVoiceChannel = await getTempVoiceByChannelId(interaction.guildId, interaction.channel.id);
    if (!tempVoiceChannel) {
      return interaction.reply({
        content: t('tempvoice.common.no-voice-channel', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (tempVoiceChannel.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.common.owner-only', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const selectedUsers = interaction.components.getSelectedMembers('invite');
    const targetUserId = selectedUsers?.first()?.id;

    if (!targetUserId) {
      return interaction.reply({
        content: t('tempvoice.invite.none', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (targetUserId === interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.invite.self', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await setVoiceChannelAccess(interaction.channel, targetUserId, true, true);

    if (!success) {
      return interaction.reply({
        content: t('tempvoice.invite.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const cacheKey = `${interaction.user.id}:${targetUserId}`;
    const wasRecentlyInvited = recentInvitesCache.has(cacheKey);

    let dmNote = '';

    if (wasRecentlyInvited) {
      dmNote = t('tempvoice.invite.dm-skipped', { lng });
    } else {
      const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

      if (targetMember) {
        const dmSent = await targetMember
          .send({
            embeds: [
              new EmbedBuilder().setTitle(t('tempvoice.invite.invite-title', { lng })).setDescription(
                t('tempvoice.invite.invite-message', {
                  channel: interaction.channel.toString(),
                  guild: interaction.guild.name,
                  inviter: interaction.user.toString(),
                }),
              ),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new LinkButtonBuilder().setLabel(t('tempvoice.invite.join-button', { lng })).setURL(interaction.channel.url),
              ),
            ],
          })
          .then(() => true)
          .catch(() => false);

        if (dmSent) {
          dmNote = t('tempvoice.invite.dm-received', { lng });
          recentInvitesCache.add(cacheKey);
          setTimeout(() => recentInvitesCache.delete(cacheKey), TEN_MINUTES_MS);
        } else {
          dmNote = t('tempvoice.invite.dm-failed', { lng });
        }
      }
    }

    return interaction.reply({
      content: t('tempvoice.invite.success', { lng, user: userMention(targetUserId) }) + `\n${dmNote}`,
      allowedMentions: { users: [] },
    });
  },
});
