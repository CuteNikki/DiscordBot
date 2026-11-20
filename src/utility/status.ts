import { createServer } from 'node:http';

import type { ClusterManager } from 'discord-hybrid-sharding';
import type { Client } from 'discord.js';

import { logger } from 'utility/logger';

/**
 * The bot's numbers over HTTP, for a dashboard such as dash to show: GET /status on STATUS_PORT (8080 by default),
 * with its servers, members and channels, its ping and how long it's been connected, from what its clusters already
 * know, so it asks Discord nothing. Only for the machine's own containers: the compose file publishes no port for it.
 *
 * The cluster manager serves it, asking every cluster for what it knows.
 */

/** The most servers the answer lists, biggest first: a big bot's would be endless. */
const LISTED = 100;

/** What one cluster knows: its shards, its ping, and the servers on its shards. */
type Part = {
  user: { name: string; id: string; avatar: string } | null;
  uptime: number | null;
  ping: number | null;
  shards: number[];
  servers: { name: string; members: number; channels: number; shard: number }[];
};

// Uses nothing from outside itself: the manager sends its source to each cluster, where nothing else from this file
// exists
const partOf = (client: Client): Part => {
  // The cluster's shards, with servers or not: a list, or a collection by id
  const ids = (client as Client & { cluster?: { ids: number[] | Map<number, unknown> } }).cluster?.ids ?? [];
  return {
    user: client.user
      ? {
          name: client.user.username,
          id: client.user.id,
          // A still picture, even of an animated avatar
          avatar: client.user.displayAvatarURL({ extension: 'png', size: 128, forceStatic: true }),
        }
      : null,
    uptime: client.uptime,
    ping: client.ping,
    shards: Array.isArray(ids) ? ids : [...ids.keys()],
    servers: client.guilds.cache.map((guild) => ({
      name: guild.name,
      members: guild.memberCount,
      channels: guild.channels.cache.size,
      shard: guild.shardId,
    })),
  };
};

async function statusOf(manager: ClusterManager) {
  // Before the clusters are up, there's nothing to ask
  const parts = (await manager.broadcastEval(partOf).catch(() => [])) as Part[];
  const user = parts.find((part) => part.user)?.user ?? null;
  const servers = parts.flatMap((part) => part.servers);
  // Each shard has its cluster's ping, which discord.js 15 keeps for all its shards together
  const shards = parts
    .flatMap((part) =>
      part.shards.map((id) => ({
        id,
        ping: part.ping === null ? null : Math.round(part.ping),
        servers: servers.filter((server) => server.shard === id).length,
      })),
    )
    .sort((a, b) => a.id - b.id);
  const pings = parts.flatMap((part) => (part.ping === null ? [] : [part.ping]));
  const uptimes = parts.flatMap((part) => (part.uptime === null ? [] : [part.uptime]));
  return {
    ready: parts.length > 0 && parts.every((part) => part.user !== null),
    name: user?.name ?? null,
    id: user?.id ?? null,
    avatar: user?.avatar ?? null,
    // Milliseconds connected, of the cluster that's been connected longest
    uptime: uptimes.length ? Math.max(...uptimes) : null,
    // Milliseconds to Discord and back, on average over its clusters
    ping: pings.length ? Math.round(pings.reduce((sum, ping) => sum + ping, 0) / pings.length) : null,
    shards,
    servers: servers.length,
    members: servers.reduce((sum, server) => sum + server.members, 0),
    channels: servers.reduce((sum, server) => sum + server.channels, 0),
    biggest: servers
      .sort((a, b) => b.members - a.members)
      .slice(0, LISTED)
      .map(({ name, members }) => ({ name, members })),
  };
}

export function serveStatus(manager: ClusterManager) {
  const port = Number(process.env.STATUS_PORT ?? 8080);
  createServer(async (request, response) => {
    if (request.method !== 'GET' || request.url !== '/status') {
      response.writeHead(404).end('Not found');
      return;
    }
    response
      .writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      .end(JSON.stringify(await statusOf(manager)));
  }).listen(port);
  logger.info(`Serving the status on port ${port}`);
}
