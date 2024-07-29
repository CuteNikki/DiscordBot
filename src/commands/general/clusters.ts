import { ApplicationIntegrationType, Colors, EmbedBuilder, InteractionContextType, SlashCommandBuilder, Status } from 'discord.js';
import { t } from 'i18next';
import ms from 'ms';

import { Command, ModuleType } from 'classes/command';

import { pagination } from 'utils/pagination';

export default new Command({
  module: ModuleType.General,
  botPermissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('clusters')
    .setDescription('Shows info about all clusters and shards')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addBooleanOption((option) => option.setName('ephemeral').setDescription('When set to false will show the message to everyone')),
  async execute({ interaction, client }) {
    const lng = await client.getUserLanguage(interaction.user.id);
    const ephemeral = interaction.options.getBoolean('ephemeral', false) ?? true;
    await interaction.deferReply({ ephemeral });

    const clusterData = await client.cluster.broadcastEval((c) => {
      return {
        clusterId: c.cluster.id,
        shardIds: [...c.cluster.ids.keys()],
        totalGuilds: c.guilds.cache.size,
        totalMembers: c.guilds.cache.map((g) => g.memberCount).reduce((a, b) => a + b, 0),
        ping: c.ws.ping,
        uptime: c.uptime,
        memoryUsage: Object.fromEntries(
          Object.entries(process.memoryUsage()).map((d) => {
            d[1] = Math.floor((d[1] / 1024 / 1024) * 100) / 100; // format to MB
            return d;
          }),
        ),
        allGuildsData: c.guilds.cache.map((guild) => {
          return {
            shardId: guild.shardId,
            id: guild.id,
            name: guild.name,
            ownerId: guild.ownerId,
            memberCount: guild.memberCount,
            channels: guild.channels.cache.map((c) => {
              return { id: c.id, name: c.name };
            }),
          };
        }),
        perShardData: [...c.cluster.ids.keys()].map((shardId) => {
          return {
            shardId: shardId,
            ping: c.ws.shards.get(shardId)?.ping,
            status: Status[c.ws.shards.get(shardId)?.status as Status],
            guilds: c.guilds.cache.filter((x) => x.shardId === shardId).size,
            members: c.guilds.cache
              .filter((x) => x.shardId === shardId)
              .map((g) => g.memberCount)
              .reduce((a, b) => a + b, 0),
          };
        }),
      };
    });

    const embeds: EmbedBuilder[] = [];
    for (const cluster of clusterData) {
      embeds.push(
        new EmbedBuilder()
          .setColor(Colors.Blurple)
          .setTitle(t('clusters.title', { lng, id: cluster.clusterId }))
          .setDescription(
            [
              t('clusters.uptime', {
                lng,
                uptime: ms(cluster.uptime ?? 0, { long: true }),
              }),
              t('clusters.ping', { lng, ping: cluster.ping }),
              t('clusters.memory', { lng, memory: cluster.memoryUsage.rss }),
              t('clusters.guilds', { lng, guilds: cluster.totalGuilds }),
              t('clusters.members', { lng, members: cluster.totalMembers }),
            ].join('\n'),
          )
          .addFields(
            cluster.perShardData.map((shard) => {
              return {
                name: t('clusters.shards.title', {
                  lng,
                  id: `${shard.shardId} ${interaction.guild?.shardId === shard.shardId ? '📍' : ''}`,
                }),
                value: [
                  t('clusters.shards.status', { lng, status: shard.status }),
                  t('clusters.shards.ping', { lng, ping: shard.ping }),
                  t('clusters.shards.guilds', { lng, guilds: shard.guilds }),
                  t('clusters.shards.members', { lng, members: shard.members }),
                ].join('\n'),
                inline: true,
              };
            }),
          )
          .setFooter({
            text: t('clusters.page', {
              lng,
              page: cluster.clusterId + 1,
              pages: clusterData.length,
            }),
          }),
      );
    }

    await pagination({
      client,
      interaction,
      embeds,
      content: t('clusters.pin', { lng }),
    });
  },
});
