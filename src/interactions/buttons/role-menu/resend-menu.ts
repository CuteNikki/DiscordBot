import {
  channelMention,
  ContainerBuilder,
  MessageFlags,
  messageLink,
  roleMention,
  SecondaryButtonBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getRoleMenuById, updateRoleMenuMessageId } from 'database/role-menu';

import { CustomIds, getRoleMenuSelectCustomId } from '../../commands/moderation/role-menu';

export default new Button({
  customId: CustomIds.RoleMenuResend,
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

    const channel = await interaction.guild.channels.fetch(roleMenu.channelId).catch(() => null);

    if (!channel || !channel.isTextBased()) {
      return await interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(t('role-menu.create.invalid-channel', { lng })),
          ),
        ],
        flags: [MessageFlags.IsComponentsV2],
        allowedMentions: { parse: [] },
      });
    }

    const container = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.default-description', { lng })))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large));
    for (const role of roleMenu.roles) {
      container.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(roleMention(role.roleId)))
          .setSecondaryButtonAccessory(
            new SecondaryButtonBuilder().setCustomId(getRoleMenuSelectCustomId(role.roleId)).setLabel(role.emoji),
          ),
      );
    }

    const message = await channel
      .send({
        components: [container],
        flags: [MessageFlags.IsComponentsV2],
        allowedMentions: { parse: [] },
      })
      .catch(() => null);
    if (!message?.id) {
      return await interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(t('role-menu.create.cant-send-message', { lng, channel: channelMention(channel.id) })),
          ),
        ],
        flags: [MessageFlags.IsComponentsV2],
        allowedMentions: { parse: [] },
      });
    }

    const menu = await updateRoleMenuMessageId(roleMenuId, message.id).catch(() => null);
    if (!menu) {
      await message.delete().catch(() => null);
      return await interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(t('role-menu.create.error-creating-menu', { lng })),
          ),
        ],
        flags: [MessageFlags.IsComponentsV2],
        allowedMentions: { parse: [] },
      });
    }

    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            t('role-menu.create.success', { lng, link: messageLink(channel.id, message.id, roleMenu.guildId) }),
          ),
        ),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  },
});
