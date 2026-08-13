import { MessageFlags, userMention } from 'discord.js';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { Modal } from 'classes/base/modal';

import { setVoiceChannelAccess } from 'utility/tempvoice';

const recentInvitesCache = new Set<string>();
const TEN_MINUTES_MS = 10 * 60 * 1000;

export default new Modal({
  customId: 'tempvoice-invite',
  async execute(interaction) {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    if (!interaction.channel.isVoiceBased()) {
      return interaction.reply({
        content: 'This can only be used in a temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const tempVoiceChannel = await getTempVoiceByChannelId(interaction.guildId, interaction.channel.id);
    if (!tempVoiceChannel) {
      return interaction.reply({
        content: 'This channel is not a temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (tempVoiceChannel.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: 'Only the owner of this temporary voice channel can invite users.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const selectedUsers = interaction.components.getSelectedMembers('invite');
    const targetUserId = selectedUsers?.first()?.id;

    if (!targetUserId) {
      return interaction.reply({
        content: 'No user was selected to invite.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (targetUserId === interaction.user.id) {
      return interaction.reply({
        content: 'You cannot invite yourself to your own channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await setVoiceChannelAccess(interaction.channel, targetUserId, true, true);

    if (!success) {
      return interaction.reply({
        content: 'Failed to invite user to the temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const cacheKey = `${interaction.user.id}:${targetUserId}`;
    const wasRecentlyInvited = recentInvitesCache.has(cacheKey);

    let dmNote = '';

    if (wasRecentlyInvited) {
      dmNote = '(DM skipped - an invite was already sent to this user in the last 10 minutes).';
    } else {
      const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

      if (targetMember) {
        const dmSent = await targetMember
          .send({
            content: `You have been invited to ${userMention(interaction.user.id)}'s voice channel: <#${interaction.channel.id}>`,
          })
          .then(() => true)
          .catch(() => false);

        if (dmSent) {
          dmNote = 'An invite message was sent to their DMs.';
          recentInvitesCache.add(cacheKey);
          setTimeout(() => recentInvitesCache.delete(cacheKey), TEN_MINUTES_MS);
        }
      }
    }

    return interaction.reply({
      content: `Granted access to <@${targetUserId}>.\n${dmNote}`,
      allowedMentions: { users: [] },
    });
  },
});
