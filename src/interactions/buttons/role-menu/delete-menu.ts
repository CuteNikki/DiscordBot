import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { deleteRoleMenu, getRoleMenuById } from 'database/role-menu';
import { CustomIds } from '../../commands/moderation/role-menu';

export default new Button({
  customId: CustomIds.RoleMenuDelete,
  userPermissions: ['ManageRoles'],
  includeCustomId: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const lng = interaction.locale;
    const roleMenuId = interaction.customId.split('_')[1];

    // If no role menu is found, inform the user
    const roleMenu = await getRoleMenuById(roleMenuId);
    if (!roleMenu || roleMenu.guildId !== interaction.guildId) {
      return interaction.editReply({ content: t('role-menu.select.no-menu', { lng }) });
    }

    // Delete the role menu from the database
    await deleteRoleMenu(roleMenuId);

    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.delete.success', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
});
