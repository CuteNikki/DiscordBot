import { MessageFlags, roleMention } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getRoleMenuByMessageId } from 'database/role-menu';

export default new Button({
  customId: 'role-menu-select',
  includeCustomId: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const lng = interaction.locale;
    const messageId = interaction.message.id;
    const selectedRoleId = interaction.customId.split('_')[1];

    // If no role menu is found, inform the user
    const roleMenu = await getRoleMenuByMessageId(interaction.guildId, messageId);
    if (!roleMenu) {
      return interaction.editReply({ content: t('role-menu.select.no-menu', { lng }) });
    }

    // Fetch the role to ensure it exists
    const role = await interaction.guild.roles.fetch(selectedRoleId).catch(() => null);
    if (!role) {
      return interaction.editReply({ content: t('role-menu.select.no-found', { lng }) });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);

    // If the user is missing any of the required roles, prevent them from using the role menu
    const missingRoles = [];
    for (const roleId of roleMenu.requiredRoles) {
      if (!member.roles.cache.has(roleId)) {
        missingRoles.push(roleId);
      }
    }
    if (missingRoles.length > 0) {
      const missingRolesMentions = missingRoles.map((roleId) => roleMention(roleId)).join(', ');
      return interaction.editReply({
        content: t('role-menu.select.missing-roles', { roles: missingRolesMentions, lng }),
      });
    }

    // If the user has any of the excluded roles, prevent them from using the role menu
    const excludedRoles = [];
    for (const roleId of roleMenu.excludedRoles) {
      if (member.roles.cache.has(roleId)) {
        excludedRoles.push(roleId);
      }
    }
    if (excludedRoles.length > 0) {
      const excludedRolesMentions = excludedRoles.map((roleId) => roleMention(roleId)).join(', ');
      return interaction.editReply({
        content: t('role-menu.select.excluded-roles', { roles: excludedRolesMentions, lng }),
      });
    }

    // Add or remove the role
    if (member.roles.cache.has(selectedRoleId)) {
      await member.roles.remove(selectedRoleId);
      return interaction.editReply({ content: t('role-menu.select.removed', { role: role.name, lng }) });
    } else {
      await member.roles.add(selectedRoleId);
      return interaction.editReply({ content: t('role-menu.select.added', { role: role.name, lng }) });
    }
  },
});
