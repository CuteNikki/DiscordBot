import {
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Command } from 'classes/base/command';
import { Pagination } from 'classes/pagination';

export default new Command({
  builder: new SlashCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
    .setName('shards')
    .setDescription('Get information about all clusters and shards'),
  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const extendedClient = interaction.client as ExtendedClient;
    // If the command is executed in a DM, the shard ID must be 0 as that is the only shard that receives DMs
    const currentShard = interaction.guild?.shardId ?? 0;

    const clusters = await extendedClient.cluster.broadcastEval((client) => ({ clusterId: client.cluster.id }));

    new Pagination({
      interaction,
      getTotalPages: () => clusters.length,
      getPageContent: async (index) => {
        const clusterData = await extendedClient.cluster.broadcastEval((client) => ({
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
        }));

        const cluster = clusterData[index];

        return [
          new EmbedBuilder()
            .setColor(Colors.White)
            .setTitle(`Cluster ${cluster.clusterId + 1}`)
            .setDescription(
              [
                `${extendedClient.customEmojis.clock} Uptime: ${cluster.uptime ? time(Math.floor((Date.now() - cluster.uptime) / 1000), TimestampStyles.RelativeTime) : 'N/A'}`,
                `${extendedClient.customEmojis.bars} Ping: ${cluster.ping ? `${Math.round(cluster.ping)}ms` : 'N/A'}`,
                `${extendedClient.customEmojis.memory} Memory: ${cluster.memoryUsage.rss}MB`,
                `${extendedClient.customEmojis.processor} CPU: ${cluster.cpuUsage}%`,
                `${extendedClient.customEmojis.server} Total Guilds: ${cluster.guildCount}`,
                `${extendedClient.customEmojis.user} Total Users: ${cluster.memberCount}`,
              ].join('\n'),
            )
            .addFields(
              cluster.perShardData.map((shard) => ({
                name: `Shard ${shard.shardId + 1}`,
                value: `${extendedClient.customEmojis.server} Guilds: ${shard.guildCount}\n${extendedClient.customEmojis.user} Users: ${shard.members}\n${shard.shardId === currentShard ? '📍 You are here' : ''}`,
                inline: true,
              })),
            ),
        ];
      },
      buttons: [
        // First page button
        () => ({
          data: new ButtonBuilder()
            .setCustomId('pagination_first')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ id: extendedClient.customEmojis.backwards.id }),
          disableOn: (index) => index === 0,
          onClick: () => ({ newIndex: 0 }),
        }),
        // Previous page button
        () => ({
          data: new ButtonBuilder()
            .setCustomId('pagination_previous')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ id: extendedClient.customEmojis.backwardstep.id }),
          disableOn: (index) => index === 0,
          onClick: (index) => ({ newIndex: index > 0 ? index - 1 : index }),
        }),
        // Next page button
        () => ({
          data: new ButtonBuilder()
            .setCustomId('pagination_next')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ id: extendedClient.customEmojis.forwardstep.id }),
          disableOn: (index, totalPages) => index === totalPages - 1,
          onClick: (index, totalPages) => ({ newIndex: index < totalPages - 1 ? index + 1 : index }),
        }),
        // Last page button
        () => ({
          data: new ButtonBuilder()
            .setCustomId('pagination_last')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji({ id: extendedClient.customEmojis.forwards.id }),
          disableOn: (index, totalPages) => index === totalPages - 1,
          onClick: (_index, totalPages) => ({ newIndex: totalPages - 1 }),
        }),
      ],
    });
  },
});
