import { RoleMenuMode } from '@prisma/client';
import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  channelMention,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  ContainerBuilder,
  DangerButtonBuilder,
  InteractionContextType,
  MessageFlags,
  messageLink,
  roleMention,
  RoleSelectMenuBuilder,
  SecondaryButtonBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SuccessButtonBuilder,
  TextDisplayBuilder,
  time,
  TimestampStyles,
  type APIChannel,
  type Channel,
  type GuildTextBasedChannel,
} from 'discord.js';
import { t } from 'i18next';

import { Command } from 'classes/base/command';

import { createRoleMenu, getRoleMenuCount, getRoleMenus } from 'database/role-menu';

export default new Command({
  builder: new ChatInputCommandBuilder()
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setName('role-menu')
    .setDescription('Manage role menus')
    .addSubcommands((cmd) => cmd.setName('create').setDescription('Create a new role menu'))
    .addSubcommands((cmd) => cmd.setName('delete').setDescription('Delete a role menu'))
    .addSubcommands((cmd) => cmd.setName('list').setDescription('List all role menus in the guild'))
    .addSubcommands((cmd) =>
      cmd
        .setName('add-option')
        .setDescription('Add a role to a role menu')
        .addStringOptions((option) => option.setName('role-menu-id').setDescription('The ID of the role menu').setRequired(true))
        .addRoleOptions((option) => option.setName('role').setDescription('The role to add to the role menu').setRequired(true))
        .addStringOptions((option) => option.setName('emoji').setDescription('The emoji associated with the role').setRequired(true)),
    )
    .addSubcommands((cmd) =>
      cmd
        .setName('remove-option')
        .setDescription('Remove a role from a role menu')
        .addStringOptions((option) => option.setName('role-menu-id').setDescription('The ID of the role menu').setRequired(true))
        .addRoleOptions((option) => option.setName('role').setDescription('The role to remove from the role menu').setRequired(true)),
    ),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply();

    const { options, locale: lng, guildId } = interaction;

    switch (options.getSubcommand()) {
      case 'list':
        await handleMenuList(interaction, guildId, lng);
        break;
      case 'create':
        await handleMenuCreate(interaction, guildId, lng);
        break;
      case 'delete':
        await handleMenuDelete(interaction, guildId, lng);
        break;
      case 'add-option':
        // await handleRoleMenuAddOption(interaction, guildId, lng);
        await interaction.editReply({ content: t('role-menu.add-option.not-implemented', { lng }) });
        break;
      case 'remove-option':
        // await handleRoleMenuRemoveOption(interaction, guildId, lng);
        await interaction.editReply({ content: t('role-menu.remove-option.not-implemented', { lng }) });
        break;
      default:
        await interaction.editReply({ content: t('role-menu.unknown-cmd', { lng }) });
        break;
    }
  },
});

async function handleMenuList(interaction: ChatInputCommandInteraction, guildId: string, lng: string) {
  const roleMenus = await getRoleMenus(guildId);

  if (roleMenus.length === 0) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.list.no-menus', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }

  const containers = [];
  for (const roleMenu of roleMenus) {
    containers.push(
      new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `**${roleMenu.id}**`,
            `${t('role-menu.list.description', { lng })} ${roleMenu.description ?? t('role-menu.list.no-description', { lng })}`,
            `${t('role-menu.list.channel', { lng })} ${channelMention(roleMenu.channelId)}`,
            `${t('role-menu.list.message', { lng })} ${messageLink(roleMenu.channelId, roleMenu.messageId, guildId)}`,
            `${t('role-menu.list.created-at', { lng })} ${time(roleMenu.createdAt, TimestampStyles.LongDateTime)} (${time(roleMenu.createdAt, TimestampStyles.RelativeTime)})`,
            `${t('role-menu.list.updated-at', { lng })} ${time(roleMenu.updatedAt, TimestampStyles.LongDateTime)} (${time(roleMenu.updatedAt, TimestampStyles.RelativeTime)})`,
            `${t('role-menu.list.required-roles', { lng })} ${
              roleMenu.requiredRoles.length > 0
                ? roleMenu.requiredRoles.map((roleId) => `<@&${roleId}>`).join(', ')
                : t('role-menu.list.no-required-roles', { lng })
            }`,
            `${t('role-menu.list.excluded-roles', { lng })} ${
              roleMenu.excludedRoles.length > 0
                ? roleMenu.excludedRoles.map((roleId) => `<@&${roleId}>`).join(', ')
                : t('role-menu.list.no-excluded-roles', { lng })
            }`,
            `${t('role-menu.list.roles', { lng })}`,
            ...roleMenu.roles.map((role) => `- <@&${role.roleId}> | ${role.emoji}`),
          ].join('\n'),
        ),
      ),
    );
  }

  await interaction.editReply({
    components: containers,
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });
}

async function handleMenuCreate(interaction: ChatInputCommandInteraction, guildId: string, lng: string) {
  const count = await getRoleMenuCount(guildId);
  if (count >= 5) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(t('role-menu.create.max-role-menus', { lng, max: 5 })),
        ),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }

  const startingMessage = await interaction.editReply({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.intro', { lng })))
        .addActionRowComponents(
          new ActionRowBuilder()
            .addDangerButtonComponents(
              new DangerButtonBuilder().setCustomId('role-menu-cancel').setLabel(t('role-menu.create.cancel', { lng })),
            )
            .addSuccessButtonComponents(
              new SuccessButtonBuilder().setCustomId('role-menu-create_start').setLabel(t('role-menu.create.start', { lng })),
            ),
        ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });

  const startingInteraction = await startingMessage
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
      componentType: ComponentType.Button,
    })
    .catch(() => null);
  if (!startingInteraction) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }
  await startingInteraction.deferUpdate();

  if (startingInteraction.customId === 'role-menu-cancel') {
    return await startingInteraction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.cancelled', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }

  const modeMessage = await startingInteraction.editReply({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.mode-prompt', { lng })))
        .addActionRowComponents(
          new ActionRowBuilder()
            .addSuccessButtonComponents(
              new SuccessButtonBuilder().setCustomId('role-menu-create_single').setLabel(t('role-menu.create.mode-single', { lng })),
            )
            .addSuccessButtonComponents(
              new SuccessButtonBuilder().setCustomId('role-menu-create_multi').setLabel(t('role-menu.create.mode-multiple', { lng })),
            ),
        ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });

  const modeInteraction = await modeMessage
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
      componentType: ComponentType.Button,
    })
    .catch(() => null);
  if (!modeInteraction) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }
  await modeInteraction.deferUpdate();

  let mode: RoleMenuMode;
  if (modeInteraction.customId === 'role-menu-create_single') {
    mode = RoleMenuMode.SingleSelect;
  } else {
    mode = RoleMenuMode.MultiSelect;
  }

  const channelMessage = await modeInteraction.editReply({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.channel-prompt', { lng })))
        .addActionRowComponents(
          new ActionRowBuilder().addChannelSelectMenuComponent(
            new ChannelSelectMenuBuilder()
              .setCustomId('role-menu-create_channel')
              .setChannelTypes(
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.AnnouncementThread,
                ChannelType.PublicThread,
                ChannelType.GuildVoice,
                ChannelType.GuildStageVoice,
              )
              .setMinValues(1)
              .setMaxValues(1)
              .setPlaceholder(t('role-menu.create.select-channel', { lng })),
          ),
        ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });
  const channelInteraction = await channelMessage
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
      componentType: ComponentType.ChannelSelect,
    })
    .catch(() => null);
  if (!channelInteraction) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }
  await channelInteraction.deferUpdate();

  function isGuildTextBasedChannel(channel: Channel | APIChannel): channel is GuildTextBasedChannel {
    return (
      'type' in channel &&
      [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.AnnouncementThread,
        ChannelType.PublicThread,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ].includes(channel.type)
    );
  }

  const channel = channelInteraction.channels.first();
  if (!channel || !isGuildTextBasedChannel(channel)) {
    return await channelInteraction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(t('role-menu.create.invalid-channel', { lng })),
        ),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }

  const rolesMessage = await channelInteraction.editReply({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.roles-prompt', { lng })))
        .addActionRowComponents(
          new ActionRowBuilder().addRoleSelectMenuComponent(
            new RoleSelectMenuBuilder()
              .setCustomId('role-menu-create_roles')
              .setMinValues(1)
              .setMaxValues(20)
              .setPlaceholder(t('role-menu.create.select-roles', { lng })),
          ),
        ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });
  const rolesInteraction = await rolesMessage
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
      componentType: ComponentType.RoleSelect,
    })
    .catch(() => null);
  if (!rolesInteraction) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }
  await rolesInteraction.deferUpdate();

  const selectedRoles = rolesInteraction.roles
    .filter((r) => !r.managed)
    .sort((a, b) => b.position - a.position)
    .first(20)
    .map((r) => r.id);

  if (selectedRoles.length === 0) {
    return await rolesInteraction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.no-roles', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }

  const excludedRolesMessage = await rolesInteraction.editReply({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.excluded-roles-prompt', { lng })))
        .addActionRowComponents(
          new ActionRowBuilder().addRoleSelectMenuComponent(
            new RoleSelectMenuBuilder()
              .setCustomId('role-menu-create_excluded-roles')
              .setDefaultRoles([])
              .setMinValues(0)
              .setMaxValues(20)
              .setPlaceholder(t('role-menu.create.select-excluded-roles', { lng })),
          ),
        ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });
  const excludedRolesInteraction = await excludedRolesMessage
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
      componentType: ComponentType.RoleSelect,
    })
    .catch(() => null);
  if (!excludedRolesInteraction) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }
  await excludedRolesInteraction.deferUpdate();

  const excludedRoles = excludedRolesInteraction.roles
    .filter((r) => !r.managed)
    .sort((a, b) => b.position - a.position)
    .first(20)
    .map((r) => r.id);

  const requiredRolesMessage = await excludedRolesInteraction.editReply({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.required-roles-prompt', { lng })))
        .addActionRowComponents(
          new ActionRowBuilder().addRoleSelectMenuComponent(
            new RoleSelectMenuBuilder()
              .setCustomId('role-menu-create_required-roles')
              .setDefaultRoles([])
              .setMinValues(0)
              .setMaxValues(20)
              .setPlaceholder(t('role-menu.create.select-required-roles', { lng })),
          ),
        ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });
  const requiredRolesInteraction = await requiredRolesMessage
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60_000,
      componentType: ComponentType.RoleSelect,
    })
    .catch(() => null);
  if (!requiredRolesInteraction) {
    return await interaction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  }
  await requiredRolesInteraction.deferUpdate();

  const requiredRoles = requiredRolesInteraction.roles
    .filter((r) => !r.managed)
    .sort((a, b) => b.position - a.position)
    .first(20)
    .map((r) => r.id);

  const roles: { roleId: string; emoji: string }[] = [];
  for (const roleId of selectedRoles) {
    const reactionMessage = await requiredRolesInteraction.editReply({
      components: [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(t('role-menu.create.emoji-prompt', { lng, role: roleMention(roleId) })),
        ),
      ],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
    if (!reactionMessage) break;

    const reactions = await reactionMessage.awaitReactions({
      max: 1,
      time: 60_000,
      filter: (_reaction, user) => user.id === interaction.user.id,
    });

    const reaction = reactions.first();
    if (!reaction) {
      return await interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.timeout', { lng }))),
        ],
        flags: [MessageFlags.IsComponentsV2],
        allowedMentions: { parse: [] },
      });
    }

    roles.push({ roleId, emoji: reaction.emoji.toString() });
    await reactionMessage.reactions.removeAll().catch(() => null);
  }

  const container = new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('role-menu.create.default-description', { lng })))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large));
  for (const role of roles) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${roleMention(role.roleId)}`))
        .setSecondaryButtonAccessory(new SecondaryButtonBuilder().setCustomId(`role-menu-select_${role.roleId}`).setLabel(role.emoji)),
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

  const menu = await createRoleMenu(guildId, channel.id, message.id, mode, roles, requiredRoles, excludedRoles).catch(() => null);
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
        new TextDisplayBuilder().setContent(t('role-menu.create.success', { lng, link: messageLink(channel.id, message.id, guildId) })),
      ),
    ],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: { parse: [] },
  });
}

async function handleMenuDelete(interaction: ChatInputCommandInteraction, guildId: string, lng: string) {
  // Implementation for deleting a role menu goes here
  await interaction.editReply({
    content: t('role-menu.delete.not-implemented', { lng }),
  });
}
