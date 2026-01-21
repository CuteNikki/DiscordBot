import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getRoleMenuById } from 'database/role-menu';

export default new Button({
  customId: 'role-menu-add-role',
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

    return interaction.editReply({ content: 'Method not implemented yet.' });
  },
});
