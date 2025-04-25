import { InfractionType, type Infraction } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, userMention } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { t } from 'i18next';

interface OverviewOptions {
  client: ExtendedClient;
  infractions: Infraction[];
  target: {
    id: string;
    displayName: string;
    imageURL: () => string | undefined;
  };
  locale: string;
  page: number;
  itemsPerPage: number;
}

export function buildInfractionOverview({ infractions, target: targetUser, page, itemsPerPage, client, locale }: OverviewOptions) {
  const staffEmoji = client.customEmojis.staff;
  const dateEmoji = client.customEmojis.date;
  const calendarEmoji = client.customEmojis.calendar;
  const receiptEmoji = client.customEmojis.receipt;
  const pencilEmoji = client.customEmojis.pencil;
  const infinityEmoji = client.customEmojis.infinity;
  const banEmoji = client.customEmojis.ban;
  const hammerEmoji = client.customEmojis.hammer;
  const exclamationEmoji = client.customEmojis.exclamation;
  const clockEmoji = client.customEmojis.clock;
  const backwardsEmoji = client.customEmojis.backwards;
  const forwardsEmoji = client.customEmojis.forwards;
  const nextEmoji = client.customEmojis.forwardstep;
  const previousEmoji = client.customEmojis.backwardstep;
  const userEmoji = client.customEmojis.user;
  const serverEmoji = client.customEmojis.server;

  const totalPages = Math.ceil(infractions.length / itemsPerPage);
  const paged = infractions.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const countByType = (type: InfractionType) => infractions.filter((infraction) => infraction.type === type).length;

  const overviewEmbed = new EmbedBuilder()
    .setColor(Colors.White)
    .setAuthor({ name: `${targetUser.displayName} - Overview`, iconURL: targetUser.imageURL() })
    .setDescription(
      [
        `${infinityEmoji} ${t('infractions.embed.total', { lng: locale, total: infractions.length })}`,
        `${banEmoji} ${t('infractions.embed.bans', { lng: locale, bans: countByType(InfractionType.Ban) })}`,
        `${calendarEmoji} ${t('infractions.embed.temp-bans', { lng: locale, tempBans: countByType(InfractionType.Tempban) })}`,
        `${hammerEmoji} ${t('infractions.embed.kicks', { lng: locale, kicks: countByType(InfractionType.Kick) })}`,
        `${exclamationEmoji} ${t('infractions.embed.warns', { lng: locale, warns: countByType(InfractionType.Warn) })}`,
        `${clockEmoji} ${t('infractions.embed.timeouts', { lng: locale, timeouts: countByType(InfractionType.Timeout) })}`,
      ].join('\n'),
    );

  const infractionEmbeds = paged.map((infraction) => {
    const guild = client.guilds.cache.get(infraction.guildId);
    const lines = [
      `**${infraction.id}**`,
      `${userEmoji} ${t('infractions.embed.user', { lng: locale, user: userMention(infraction.userId) })}`,
      `${serverEmoji} ${t('infractions.embed.guild', { lng: locale, guild: guild ? guild.name + ` (${infraction.guildId})` : infraction.guildId })}`,
      `${receiptEmoji} ${t('infractions.embed.type', { lng: locale, type: infraction.type })}`,
      `${pencilEmoji} ${t('infractions.embed.reason', { lng: locale, reason: infraction.reason })}`,
      `${staffEmoji} ${t('infractions.embed.moderator', { lng: locale, moderator: userMention(infraction.moderatorId) })}`,
    ];

    if (infraction.expiresAt) {
      lines.push(
        `${calendarEmoji} ${infraction.isActive ? t('infractions.embed.expires', { lng: locale, expires: `<t:${Math.floor(infraction.expiresAt.getTime() / 1000)}:R>` }) : t('infractions.embed.expired', { lng: locale, expired: `<t:${Math.floor(infraction.expiresAt.getTime() / 1000)}:R>` })}`,
      );
    }

    lines.push(
      `${dateEmoji} ${t('infractions.embed.date', { lng: locale, date: `<t:${Math.floor(infraction.createdAt.getTime() / 1000)}:R>` })}`,
    );

    return new EmbedBuilder().setColor(Colors.White).setDescription(lines.join('\n'));
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`infractions-first_${targetUser.id}`)
      .setEmoji({ id: backwardsEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`infractions-previous_${page}_${targetUser.id}`)
      .setEmoji({ id: previousEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`infractions-custom_${targetUser.id}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`infractions-next_${page}_${targetUser.id}`)
      .setEmoji({ id: nextEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`infractions-last_${targetUser.id}`)
      .setEmoji({ id: forwardsEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
  );

  return {
    embeds: [overviewEmbed, ...infractionEmbeds],
    components: [row],
  };
}
