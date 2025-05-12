import { InfractionType, type Infraction } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  userMention,
  type InteractionEditReplyOptions,
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
  showGuild: boolean;
  showUser: boolean;
}

export function buildInfractionOverview({
  infractions,
  target,
  page,
  itemsPerPage,
  client,
  locale,
  sortBy,
  sortOrder,
  showGuild,
  showUser,
}: OverviewOptions): InteractionEditReplyOptions {
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
  const emptyEmoji = client.customEmojis.empty;
  const deleteEmoji = client.customEmojis.trash;

  const totalPages = Math.ceil(infractions.length / itemsPerPage);
  const paged = infractions.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const countByType = (type: InfractionType) => infractions.filter((infraction) => infraction.type === type).length;

  const container = new ContainerBuilder()
    .setAccentColor(Colors.White)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${emptyEmoji} **${t('infractions.embed.title', { lng: locale, user: target.displayName })}**`,
          ),
          new TextDisplayBuilder().setContent(
            [
              `${infinityEmoji} ${t('infractions.embed.total', { lng: locale, total: infractions.length })}`,
              `${banEmoji} ${t('infractions.embed.bans', { lng: locale, bans: countByType(InfractionType.Ban) })}`,
              `${calendarEmoji} ${t('infractions.embed.temp-bans', { lng: locale, tempBans: countByType(InfractionType.Tempban) })}`,
              `${hammerEmoji} ${t('infractions.embed.kicks', { lng: locale, kicks: countByType(InfractionType.Kick) })}`,
              `${exclamationEmoji} ${t('infractions.embed.warns', { lng: locale, warns: countByType(InfractionType.Warn) })}`,
              `${clockEmoji} ${t('infractions.embed.timeouts', { lng: locale, timeouts: countByType(InfractionType.Timeout) })}`,
            ].join('\n'),
          ),
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(target.imageURL() ?? '')),
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

  paged.map((infraction, index) => {
    const guild = client.guilds.cache.get(infraction.guildId);

    const lines = [`${emptyEmoji} **${infraction.id}**`];

    if (showUser) lines.push(`${userEmoji} ${t('infractions.embed.user', { lng: locale, user: userMention(infraction.userId) })}`);
    if (showGuild)
      lines.push(
        `${serverEmoji} ${t('infractions.embed.guild', { lng: locale, guild: guild ? guild.name + ` (${infraction.guildId})` : infraction.guildId })}`,
      );
    lines.push(
      `${receiptEmoji} ${t('infractions.embed.type', { lng: locale, type: infraction.type })}`,
      `${pencilEmoji} ${t('infractions.embed.reason', { lng: locale, reason: infraction.reason })}`,
      `${staffEmoji} ${t('infractions.embed.moderator', { lng: locale, moderator: userMention(infraction.moderatorId) })}`,
    );
    if (infraction.expiresAt)
      lines.push(
        `${calendarEmoji} ${infraction.isActive ? t('infractions.embed.expires', { lng: locale, expires: `<t:${Math.floor(infraction.expiresAt.getTime() / 1000)}:R>` }) : t('infractions.embed.expired', { lng: locale, expired: `<t:${Math.floor(infraction.expiresAt.getTime() / 1000)}:R>` })}`,
      );
    lines.push(
      `${dateEmoji} ${t('infractions.embed.date', { lng: locale, date: `<t:${Math.floor(infraction.createdAt.getTime() / 1000)}:R>` })}`,
    );

    if (!showGuild) {
      container.addSectionComponents(
        new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n'))).setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`infractions-delete_${infraction.id}`)
            .setEmoji({ id: deleteEmoji.id })
            .setStyle(ButtonStyle.Danger)
            .setLabel(t('infractions.embed.delete', { lng: locale })),
        ),
      );
    } else {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')));
    }

    if (index < paged.length - 1) container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  });

  const rowPages = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`infractions-first_${target.id}_${sortOrder}_${sortBy}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
      .setEmoji({ id: backwardsEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`infractions-previous_${page}_${target.id}_${sortOrder}_${sortBy}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
      .setEmoji({ id: previousEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`infractions-custom_${target.id}_${sortOrder}_${sortBy}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`infractions-next_${page}_${target.id}_${sortOrder}_${sortBy}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
      .setEmoji({ id: nextEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`infractions-last_${target.id}_${sortOrder}_${sortBy}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
      .setEmoji({ id: forwardsEmoji.id })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
  );
  const rowSortBy = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`infractions-sort-by_${target.id}_${sortOrder}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
      .setPlaceholder(t('infractions.sort-by.placeholder', { lng: locale }))
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-by.prefix', { lng: locale }) + ' ' + t('infractions.sort-by.created', { lng: locale }))
          .setValue(InfractionSortBy.createdAt.toString())
          .setEmoji({ id: dateEmoji.id })
          .setDefault(sortBy === InfractionSortBy.createdAt),
        new StringSelectMenuOptionBuilder()
          .setLabel(t('infractions.sort-by.prefix', { lng: locale }) + ' ' + t('infractions.sort-by.expires', { lng: locale }))
          .setValue(InfractionSortBy.expiresAt.toString())
          .setEmoji({ id: calendarEmoji.id })
          .setDefault(sortBy === InfractionSortBy.expiresAt),
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
      .setCustomId(`infractions-sort-order_${target.id}_${sortBy}_${showGuild ? 1 : 0}_${showUser ? 1 : 0}`)
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

  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
  container.addActionRowComponents(rowPages);
  container.addActionRowComponents(rowSortBy);
  container.addActionRowComponents(rowSortOrder);

  return {
    allowedMentions: { users: [] }, // Prevents pinging users
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  };

  // return {
  //   embeds: [overviewEmbed, ...infractionEmbeds],
  //   components: [rowPages, rowSortBy, rowSortOrder],
  // };
}
