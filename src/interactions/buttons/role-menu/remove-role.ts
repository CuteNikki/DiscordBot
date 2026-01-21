import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getRoleMenuById } from 'database/role-menu';

import { CustomIds, getRoleMenuRemoveModalCustomId } from '../../commands/moderation/role-menu';

export default new Button({
  customId: CustomIds.RoleMenuRemoveRole,
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
        .setCustomId(getRoleMenuRemoveModalCustomId(roleMenuId))
        .setTitle(t('role-menu.remove-role.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder().setLabel(t('role-menu.remove-role.modal.role-id-label', { lng })).setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
              .setCustomId('role-select')
              .setOptions(
                roleMenu.roles.map((role) =>
                  new StringSelectMenuOptionBuilder()
                    .setLabel(interaction.guild.roles.cache.get(role.roleId)?.name || role.roleId)
                    .setDescription(
                      t('role-menu.remove-role.modal.role-option-description', { lng, emoji: role.emoji, roleId: role.roleId }),
                    )
                    .setValue(role.roleId),
                ),
              )
              .setMinValues(1)
              .setMaxValues(1)
              .setRequired(true),
          ),
        ),
    );
  },
});
