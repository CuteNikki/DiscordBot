import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { t } from 'i18next';

import { Command, ModuleType } from 'classes/command';

import { createInfraction } from 'db/infraction';
import { getUserLanguage } from 'db/user';

import { InfractionType } from 'types/infraction';

import { logger } from 'utils/logger';

export default new Command({
  module: ModuleType.Moderation,
  botPermissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) => option.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the warn').setMaxLength(300).setRequired(false)),
  async execute({ interaction, client }) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    enum CustomIds {
      Confirm = 'WARN_CONFIRM',
      Cancel = 'WARN_CANCEL',
    }

    const { options, guild, user } = interaction;

    const target = options.getUser('user', true);
    const targetMember = await guild.members.fetch(target.id).catch((err) => logger.debug({ err, userId: target.id }, 'Could not fetch target member'));

    const lng = await getUserLanguage(interaction.user.id);
    const targetLng = await getUserLanguage(target.id);

    if (!targetMember) {
      await interaction.editReply(t('warn.target.invalid', { lng }));
      return;
    }

    const targetRolePos = targetMember?.roles.highest.position ?? 0;
    const staffRolePos = interaction.member.roles.highest.position ?? 0;

    if (targetRolePos >= staffRolePos) {
      await interaction.editReply(t('warn.target.pos_staff', { lng }));
      return;
    }

    const reason = options.getString('reason', false) ?? undefined;

    const msg = await interaction.editReply({
      content: t('warn.confirm', { lng, user: target.toString() }),
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder().setCustomId(CustomIds.Confirm).setEmoji('✔').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(CustomIds.Cancel).setEmoji('✖').setStyle(ButtonStyle.Danger),
        ),
      ],
    });

    const collector = await msg.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      componentType: ComponentType.Button,
      time: 30_000,
    });

    if (collector.customId === CustomIds.Cancel) {
      await collector.update({
        content: t('warn.cancelled', { lng }),
        components: [],
      });
    } else if (collector.customId === CustomIds.Confirm) {
      const receivedDM = await client.users
        .send(target.id, {
          content: t('warn.target_dm', {
            lng: targetLng,
            guild: `\`${guild.name}\``,
            reason: `\`${reason ?? '/'}\``,
          }),
        })
        .catch((err) => logger.debug({ err, userId: target.id }, 'Could not send DM'));

      await collector.update({
        content: [
          t('warn.confirmed', {
            lng,
            user: target.toString(),
            reason: `\`${reason ?? '/'}\``,
          }),
          receivedDM ? t('warn.dm_received', { lng }) : t('warn.dm_not_received', { lng }),
        ].join('\n'),
        components: [],
      });

      if (target.bot) {
        return;
      }

      await createInfraction(guild.id, target.id, user.id, InfractionType.Warn, reason, undefined, Date.now(), true);
    }
  },
});
