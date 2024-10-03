import { EmbedBuilder, type TextChannel } from 'discord.js';
import { t } from 'i18next';

import { Selection } from 'classes/selection';

import { getGuildSettings } from 'db/guild';
import { ticketModel } from 'models/ticket';

export default new Selection({
  customId: 'selection-tickets-user',
  isCustomIdIncluded: true,
  permissions: [],
  botPermissions: ['ManageChannels', 'SendMessages'],
  async execute({ interaction }) {
    if (!interaction.inCachedGuild() || !interaction.isUserSelectMenu()) return;
    const {
      user,
      values: [targetId],
      guildId,
      customId,
      member
    } = interaction;
    const targetMember = interaction.guild.members.cache.get(targetId);

    const currentConfig = await getGuildSettings(guildId);
    const lng = currentConfig.language;

    const system = currentConfig.ticket.systems.find((system) => system._id.toString() === customId.split('_')[1]);

    if (!system) {
      await interaction.reply({
        content: t('ticket.invalid-system', { lng }),
        ephemeral: true
      });
      return;
    }

    const ticket = await ticketModel.findOne({ channelId: interaction.channel?.id });

    if (!ticket) {
      await interaction.reply({
        content: t('ticket.invalid-ticket', { lng }),
        ephemeral: true
      });
      return;
    }

    if (ticket.closed || ticket.locked) {
      await interaction.reply({
        content: t('ticket.user-unavailable', { lng }),
        ephemeral: true
      });
      return;
    }

    if (user.id !== ticket.createdBy || !member.roles.cache.has(system.staffRoleId)) {
      await interaction.reply({ content: t('ticket.user-permissions', { lng }) });
      return;
    }

    if (!targetMember) {
      await interaction.reply({
        content: t('ticket.user-invalid', { lng }),
        ephemeral: true
      });
      return;
    }

    if (targetMember.roles.cache.has(system.staffRoleId)) {
      await interaction.reply({
        content: t('ticket.user-staff', { lng }),
        ephemeral: true
      });
      return;
    }

    if (targetId === ticket.createdBy) {
      await interaction.reply({
        content: t('ticket.user-creator', { lng }),
        ephemeral: true
      });
      return;
    }

    if (ticket.users.includes(targetId)) {
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(targetId, {
        ViewChannel: false,
        SendMessages: false,
        EmbedLinks: false,
        AttachFiles: false
      });
      await ticketModel.findOneAndUpdate({ channelId: channel.id }, { $pull: { users: targetId } });

      await interaction.reply({
        embeds: [
          new EmbedBuilder().setDescription(
            t('ticket.user-removed', {
              lng,
              targetUser: `<@${targetId}>`,
              removedBy: user.toString()
            })
          )
        ]
      });
    } else {
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(targetId, {
        ViewChannel: true,
        SendMessages: true,
        EmbedLinks: true,
        AttachFiles: true
      });
      await ticketModel.findOneAndUpdate({ channelId: channel.id }, { $push: { users: targetId } });

      await interaction.reply({
        embeds: [
          new EmbedBuilder().setDescription(
            t('ticket.user-added', {
              lng,
              targetUser: `<@${targetId}>`,
              addedBy: user.toString()
            })
          )
        ]
      });
    }
  }
});
