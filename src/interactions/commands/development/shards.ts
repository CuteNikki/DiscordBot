import {
  ApplicationIntegrationType,
  ChatInputCommandBuilder,
  Colors,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  SecondaryButtonBuilder,
  time,
  TimestampStyles,
} from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Command } from 'classes/base/command';
import { Pagination } from 'classes/pagination';

import { logger } from 'utility/logger';
import { customPagePreset, firstPagePreset, lastPagePreset, nextPagePreset, previousPagePreset } from 'utility/pagination';

export default new Command({
  builder: new ChatInputCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
    .setName('shards')
    .setDescription('Get information about all clusters and shards'),
  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const extendedClient = interaction.client as ExtendedClient;
    // If the command is executed in a DM, the shard ID must be 0 as that is the only shard that receives DMs
    const currentShard = interaction.guild?.shardId ?? 0;

    const clusters = await extendedClient.cluster
      .broadcastEval((client) => ({ clusterId: client.cluster.id }))
      .catch((err) => {
        logger.error({ err }, 'Failed to fetch cluster information');
        return [];
      });
    if (!clusters?.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor(Colors.Red).setTitle('Error').setDescription('An error occurred while fetching cluster information.'),
        ],
      });
    }

    new Pagination({
      interaction,
      getTotalPages: () => clusters.length,
      getPageContent: async (pageIndex) => {
        const clusterData = await extendedClient.cluster
          .broadcastEval((client) => ({
            clusterId: client.cluster.id,
            shardId: client.cluster.shardList,
            guildCount: client.guilds.cache.size,
            memberCount: client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0),
            channelCount: client.channels.cache.size,
            ping: client.ping,
            uptime: client.uptime,
            cpuUsage: Math.round((process.cpuUsage().user + process.cpuUsage().system) / 1000 / 1000),
            memoryUsage: Object.fromEntries(
              Object.entries(process.memoryUsage()).map((d) => {
                d[1] = Math.round((d[1] / 1024 / 1024) * 100) / 100; // Convert to MB
                return d;
              }),
            ),
            guildsData: client.guilds.cache.map((guild) => ({
              shardId: guild.shardId,
              id: guild.id,
              name: guild.name,
              ownerId: guild.ownerId,
              memberCount: guild.memberCount,
              channels: guild.channels.cache.map((channel) => ({ id: channel.id, name: channel.name, type: channel.type })),
            })),
            perShardData: client.cluster.shardList.map((shardId) => ({
              shardId,
              guildCount: client.guilds.cache.filter((guild) => guild.shardId === shardId).size,
              members: client.guilds.cache
                .filter((guild) => guild.shardId === shardId)
                .map((guild) => guild.memberCount)
                .reduce((total, count) => total + count, 0),
            })),
          }))
          .catch((err) => {
            logger.error({ err }, `Failed to fetch cluster data for cluster ${pageIndex + 1}`);
            return [];
          });
        if (!clusterData?.length) {
          return [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setTitle('Error')
              .setDescription(`An error occurred while fetching data for cluster ${pageIndex + 1}.`),
          ];
        }

        const cluster = clusterData[pageIndex];

        return [
          new EmbedBuilder()
            .setColor(Colors.White)
            .setTitle(`Cluster ${cluster.clusterId + 1}`)
            .setDescription(
              [
                `${extendedClient.getCustomEmoji('clock')} Uptime: ${cluster.uptime ? time(Math.floor((Date.now() - cluster.uptime) / 1000), TimestampStyles.RelativeTime) : 'N/A'}`,
                `${extendedClient.getCustomEmoji('bars')} Ping: ${cluster.ping ? `${Math.round(cluster.ping)}ms` : 'N/A'}`,
                `${extendedClient.getCustomEmoji('memory')} Memory: ${cluster.memoryUsage.rss}MB`,
                `${extendedClient.getCustomEmoji('processor')} CPU: ${cluster.cpuUsage}%`,
                `${extendedClient.getCustomEmoji('server')} Total Guilds: ${cluster.guildCount}`,
                `${extendedClient.getCustomEmoji('user')} Total Users: ${cluster.memberCount}`,
              ].join('\n'),
            )
            .addFields(
              cluster.perShardData.map((shard) => ({
                name: `Shard ${shard.shardId + 1}`,
                value: `${extendedClient.getCustomEmoji('server')} Guilds: ${shard.guildCount}\n${extendedClient.getCustomEmoji('user')} Users: ${shard.members}\n${shard.shardId === currentShard ? '📍 You are here' : ''}`,
                inline: true,
              })),
            ),
        ];
      },
      buttons: [
        // First page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_first').setEmoji({ id: extendedClient.getCustomEmoji('backwards').id }),
          ...firstPagePreset,
        }),
        // Previous page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_prev').setEmoji({ id: extendedClient.getCustomEmoji('backwardstep').id }),
          ...previousPagePreset,
        }),
        (i, total) => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_custom').setLabel(`${i + 1} / ${total}`),
          ...customPagePreset,
        }),
        // Next page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_next').setEmoji({ id: extendedClient.getCustomEmoji('forwardstep').id }),
          ...nextPagePreset,
        }),
        // Last page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_last').setEmoji({ id: extendedClient.getCustomEmoji('forwards').id }),
          ...lastPagePreset,
        }),
      ],
    });
  },
});
