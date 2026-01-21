import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { addRoleMenuRole, getRoleMenuById } from 'database/role-menu';

import { KEYS } from 'utility/keys';

import { CustomIds } from '../../commands/moderation/role-menu';

export default new Modal({
  customId: CustomIds.RoleMenuAddModal,
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

    const selectedRoles = interaction.components.getSelectedRoles('role-select', true);
    const selectedRoleId = selectedRoles.first()?.id;
    const emojiInput = interaction.components.getTextInputValue('role-emoji');

    if (!selectedRoleId) {
      return interaction.editReply({ content: t('role-menu.add.no-role-selected', { lng }) });
    }

    if (!emojiInput.length || emojiInput.length > 2 || !/^[\p{Emoji}\u200d]+$/u.test(emojiInput)) {
      return interaction.editReply({ content: t('role-menu.add.invalid-emoji', { lng }) });
    }

    // Check if the role is already in the role menu
    if (roleMenu.roles.map((role) => role.roleId).includes(selectedRoleId)) {
      return interaction.editReply({ content: t('role-menu.add.role-already-exists', { lng }) });
    }

    if (roleMenu.roles.map((role) => role.emoji).includes(emojiInput)) {
      return interaction.editReply({ content: t('role-menu.add.emoji-already-exists', { lng }) });
    }

    if (roleMenu.roles.length >= KEYS.ROLE_MENU_MAX_ROLES) {
      return interaction.editReply({ content: t('role-menu.add.max-roles-reached', { lng, max: KEYS.ROLE_MENU_MAX_ROLES }) });
    }

    await addRoleMenuRole(roleMenuId, selectedRoleId, emojiInput);
    return interaction.editReply({ content: t('role-menu.add.success', { lng }) });
  },
});
