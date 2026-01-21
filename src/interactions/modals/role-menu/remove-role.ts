import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getRoleMenuById, removeRoleMenuRole } from 'database/role-menu';

import { CustomIds } from '../../commands/moderation/role-menu';

export default new Modal({
  customId: CustomIds.RoleMenuRemoveModal,
  userPermissions: ['ManageRoles'],
  includeCustomId: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const lng = interaction.locale;
    const roleMenuId = interaction.customId.split('_')[1];

    const roleMenu = await getRoleMenuById(roleMenuId);
    if (!roleMenu || roleMenu.guildId !== interaction.guildId) {
      return interaction.editReply({ content: t('role-menu.select.no-menu', { lng }) });
    }

    const selectedRoles = interaction.components.getStringSelectValues('role-select');
    const selectedRoleId = selectedRoles[0];

    if (!selectedRoleId) {
      return interaction.editReply({ content: t('role-menu.remove.no-role-selected', { lng }) });
    }

    // Check if the role exists in the role menu
    if (!roleMenu.roles.map((role) => role.roleId).includes(selectedRoleId)) {
      return interaction.editReply({ content: t('role-menu.remove.role-not-found', { lng }) });
    }

    await removeRoleMenuRole(roleMenuId, selectedRoleId);
    return interaction.editReply({ content: t('role-menu.remove.success', { lng }) });
  },
});
