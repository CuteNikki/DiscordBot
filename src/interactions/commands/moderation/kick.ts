import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';
import { t } from 'i18next';

import { Command, ModuleType } from 'classes/command';

import { createInfraction } from 'db/infraction';
import { getUserLanguage } from 'db/language';

import { InfractionType } from 'types/infraction';

import { logger } from 'utils/logger';

export default new Command({
  module: ModuleType.Moderation,
  botPermissions: ['KickMembers', 'SendMessages'],
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setMaxLength(300).setRequired(false)),
  async execute({ interaction, client, lng }) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    enum CustomIds {
      Confirm = 'button-kick-confirm',
      Cancel = 'button-ban-confirm'
    }

    const { options, guild, member, user } = interaction;

    const target = options.getUser('user', true);
    const targetMember = await guild.members.fetch(target.id).catch((err) => logger.debug({ err, userId: target.id }, 'Could not fetch target member'));

    if (!targetMember) {
      await interaction.editReply(t('kick.target.invalid', { lng }));
      return;
    }

    const reason = options.getString('reason', false) ?? undefined;

    const targetRolePos = targetMember.roles.highest.position ?? 0;
    const staffRolePos = member.roles.highest.position ?? 0;
    const botRolePos = guild.members.me?.roles.highest.position ?? 0;

    if (targetRolePos >= staffRolePos) {
      await interaction.editReply(t('kick.target.pos-staff', { lng }));
      return;
    }
    if (targetRolePos >= botRolePos) {
      await interaction.editReply(t('kick.target.pos-bot', { lng }));
      return;
    }

    if (!targetMember.kickable) {
      await interaction.editReply(t('kick.target.kickable', { lng }));
      return;
    }

    const msg = await interaction.editReply({
      content: t('kick.confirm', { lng, user: target.toString() }),
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder().setCustomId(CustomIds.Confirm).setEmoji('✔').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(CustomIds.Cancel).setEmoji('✖').setStyle(ButtonStyle.Danger)
        )
      ]
    });

    const collector = await msg.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      componentType: ComponentType.Button,
      time: 30_000
    });

    if (collector.customId === CustomIds.Cancel) {
      await collector.update({
        content: t('kick.cancelled', { lng }),
        components: []
      });
    } else if (collector.customId === CustomIds.Confirm) {
      const kicked = await targetMember.kick(reason).catch((err) => logger.debug({ err, userId: target.id }, 'Could not kick user'));

      if (!kicked) {
        await collector.update(t('kick.failed', { lng }));
        return;
      }

      const receivedDM = await client.users
        .send(target.id, {
          content: t('kick.target-dm', {
            lng: await getUserLanguage(target.id),
            guild: `\`${guild.name}\``,
            reason: `\`${reason ?? '/'}\``
          })
        })
        .catch((err) => logger.debug({ err, userId: target.id }, 'Could not send DM'));

      await collector.update({
        content: [
          t('kick.confirmed', { lng, user: target.toString(), reason: `\`${reason ?? t('none', { lng })}\`` }),
          receivedDM ? t('kick.dm-received', { lng }) : t('kick.dm-not-received', { lng })
        ].join('\n'),
        components: []
      });

      if (target.bot) {
        return;
      }

      await createInfraction(guild.id, target.id, user.id, InfractionType.Kick, reason, undefined, Date.now(), true);
    }
  }
});
