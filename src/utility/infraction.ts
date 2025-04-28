import { InfractionType, type Infraction } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  userMention,
} from 'discord.js';
import { t } from 'i18next';

import type { ExtendedClient } from 'classes/base/client';

import { InfractionSortBy, InfractionSortOrder } from 'types/infraction';

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
  sortBy: InfractionSortBy;
  sortOrder: InfractionSortOrder;
}

export function buildInfractionOverview({ infractions, target, page, itemsPerPage, client, locale, sortBy, sortOrder }: OverviewOptions) {
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
  const ascendingEmoji = client.customEmojis.ascending;
  const descendingEmoji = client.customEmojis.descending;

  const totalPages = Math.ceil(infractions.length / itemsPerPage);
  const paged = infractions.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const countByType = (type: InfractionType) => infractions.filter((infraction) => infraction.type === type).length;

  const overviewEmbed = new EmbedBuilder()
    .setColor(Colors.White)
    .setAuthor({ name: `${target.displayName} - Overview`, iconURL: target.imageURL() })
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

  const rowPages = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`infractions-first_${target.id}_${sortOrder}_${sortBy}`)
      .setEmoji({ id: backwardsEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`infractions-previous_${page}_${target.id}_${sortOrder}_${sortBy}`)
      .setEmoji({ id: previousEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`infractions-custom_${target.id}_${sortOrder}_${sortBy}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`infractions-next_${page}_${target.id}_${sortOrder}_${sortBy}`)
      .setEmoji({ id: nextEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`infractions-last_${target.id}_${sortOrder}_${sortBy}`)
      .setEmoji({ id: forwardsEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
  );
  const rowSortBy = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`infractions-sort-by_${target.id}_${sortOrder}_${sortBy}`)
      .setPlaceholder(t('infractions.sort-by.placeholder', { lng: locale }))
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-by.prefix', { lng: locale }) + ' ' + t('infractions.sort-by.created', { lng: locale }))
          .setValue(InfractionSortBy.createdAt.toString())
          .setEmoji({ id: dateEmoji.id })
          .setDefault(sortBy === InfractionSortBy.createdAt),
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-by.prefix', { lng: locale }) + ' ' + t('infractions.sort-by.type', { lng: locale }))
          .setValue(InfractionSortBy.type.toString())
          .setEmoji({ id: pencilEmoji.id })
          .setDefault(sortBy === InfractionSortBy.type),
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-by.prefix', { lng: locale }) + ' ' + t('infractions.sort-by.moderator', { lng: locale }))
          .setValue(InfractionSortBy.moderatorId.toString())
          .setEmoji({ id: staffEmoji.id })
          .setDefault(sortBy === InfractionSortBy.moderatorId),
      ),
  );
  const rowSortOrder = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`infractions-sort-order_${target.id}_${sortOrder}_${sortBy}`)
      .setPlaceholder(t('infractions.sort-order.placeholder', { lng: locale }))
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-order.prefix', { lng: locale }) + ' ' + t('infractions.sort-order.ascending', { lng: locale }))
          .setValue(InfractionSortOrder.asc.toString())
          .setEmoji({ id: ascendingEmoji.id })
          .setDefault(sortOrder === InfractionSortOrder.asc),
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-order.prefix', { lng: locale }) + ' ' + t('infractions.sort-order.descending', { lng: locale }))
          .setValue(InfractionSortOrder.desc.toString())
          .setEmoji({ id: descendingEmoji.id })
          .setDefault(sortOrder === InfractionSortOrder.desc),
      ),
  );

  return {
    embeds: [overviewEmbed, ...infractionEmbeds],
    components: [rowPages, rowSortBy, rowSortOrder],
  };
}
