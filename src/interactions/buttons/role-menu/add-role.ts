import { LabelBuilder, ModalBuilder, RoleSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getRoleMenuById } from 'database/role-menu';

import { CustomIds, getRoleMenuAddModalCustomId } from '../../commands/moderation/role-menu';

export default new Button({
  customId: CustomIds.RoleMenuAddRole,
  userPermissions: ['ManageRoles'],
  includeCustomId: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    const lng = interaction.locale;
    const roleMenuId = interaction.customId.split('_')[1];

    // If no role menu is found, inform the user
    const roleMenu = await getRoleMenuById(roleMenuId);
    if (!roleMenu || roleMenu.guildId !== interaction.guildId) {
      return interaction.editReply({ content: t('role-menu.select.no-menu', { lng }) });
    }

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId(getRoleMenuAddModalCustomId(roleMenuId))
        .setTitle(t('role-menu.add-role.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('role-menu.add-role.modal.role-id-label', { lng }))
            .setRoleSelectMenuComponent(
              new RoleSelectMenuBuilder().setCustomId('role-select').setMinValues(1).setMaxValues(1).setRequired(true),
            ),
          new LabelBuilder()
            .setLabel(t('role-menu.add-role.modal.role-emoji-label', { lng }))
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId('role-emoji')
                .setStyle(TextInputStyle.Short)
                .setMinLength(0)
                .setMaxLength(2)
                .setRequired(true),
            ),
        ),
    );
  },
});
