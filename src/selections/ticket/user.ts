import { EmbedBuilder, type TextChannel } from 'discord.js';
import { t } from 'i18next';

import { Selection } from 'classes/selection';
import { ticketModel } from 'models/ticket';

export default new Selection({
  customId: 'tickets-user',
  isCustomIdIncluded: true,
  async execute({ interaction, client }) {
    if (!interaction.inCachedGuild() || !interaction.isUserSelectMenu()) return;
    const {
      user,
      values: [targetId],
      guildId,
      customId,
      member,
    } = interaction;
    const targetMember = interaction.guild.members.cache.get(targetId);

    const currentConfig = await client.getGuildSettings(guildId);
    const lng = currentConfig.language;

    const system = currentConfig.ticket.systems.find((system) => system._id.toString() === customId.split('_')[1]);

    if (!system) return interaction.reply({ content: t('tickets.invalid_system', { lng }), ephemeral: true });

    const ticket = await ticketModel.findOne({ channelId: interaction.channel?.id });
    if (!ticket) return interaction.reply({ content: t('tickets.invalid_ticket', { lng }), ephemeral: true });

    if (ticket.closed || ticket.locked) return interaction.reply({ content: t('tickets.user_unavailable', { lng }), ephemeral: true });

    if (user.id !== ticket.createdBy || !member.roles.cache.has(system.staffRoleId)) return interaction.reply({ content: t('tickets.user_permissions') });

    if (!targetMember) return interaction.reply({ content: t('tickets.user_invalid', { lng }), ephemeral: true });
    if (targetMember.roles.cache.has(system.staffRoleId)) return interaction.reply({ content: t('tickets.user_staff', { lng }), ephemeral: true });
    if (targetId === ticket.createdBy) return interaction.reply({ content: t('tickets.user_creator', { lng }), ephemeral: true });

    if (ticket.users.includes(targetId)) {
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(targetId, { ViewChannel: false, SendMessages: false, EmbedLinks: false, AttachFiles: false });
      await ticketModel.findOneAndUpdate({ channelId: channel.id }, { $pull: { users: targetId } });

      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription(t('tickets.user_removed', { lng, target_user: `<@${targetId}>`, removed_by: `${user.toString}` }))],
      });
    } else {
      const channel = interaction.channel as TextChannel;
      await channel.permissionOverwrites.edit(targetId, { ViewChannel: true, SendMessages: true, EmbedLinks: true, AttachFiles: true });
      await ticketModel.findOneAndUpdate({ channelId: channel.id }, { $push: { users: targetId } });

      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription(t('tickets.user_added', { lng, target_user: `<@${targetId}>`, added_by: `${user.toString()}` }))],
      });
    }
  },
});
