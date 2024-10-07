import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/button';

import { getReactionRoles } from 'db/reaction-roles';

export default new Button({
  customId: 'button-reaction-select',
  isCustomIdIncluded: true,
  botPermissions: ['ManageRoles'],
  async execute({ client, interaction, lng }) {
    if (!interaction.inCachedGuild()) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const reactionRoles = await getReactionRoles(interaction.guildId);

    if (!reactionRoles) return;

    const group = reactionRoles.groups.find((g) => g.messageId === interaction.message.id);

    if (!group) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription(t('reaction-roles.select.unknown-group', { lng }))]
      });
      return;
    }

    const reactionIndex = parseInt(interaction.customId.split('_')[1]);
    const reaction = group.reactions[reactionIndex];

    if (!reaction) {
      return;
    }

    const role = interaction.guild.roles.cache.get(reaction.roleId);

    if (!role) {
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription(t('reaction-roles.select.role-not-found', { lng }))]
      });
    }

    if (interaction.member.roles.cache.has(reaction.roleId)) {
      await interaction.member.roles.remove(role).catch((err) => console.error(err));
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(client.colors.success).setDescription(t('reaction-roles.select.removed', { lng, role: role.toString() }))]
      });
    } else {
      await interaction.member.roles.add(role).catch((err) => console.error(err));
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(client.colors.success).setDescription(t('reaction-roles.select.added', { lng, role: role.toString() }))]
      });
    }
  }
});
