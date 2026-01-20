import { ClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';

import { KEYS } from 'utility/keys';
import { logger } from 'utility/logger';

const manager = new ClusterManager('src/bot.ts', {
  totalShards: 'auto',
  shardsPerClusters: KEYS.SHARDS_PER_CLUSTERS,
  execArgv: [...process.execArgv],
  shardArgs: process.argv,
  mode: 'process',
  token: KEYS.DISCORD_BOT_TOKEN,
});

manager.extend(
  new HeartbeatManager({
    // If shard is not responding for 60 seconds
    interval: KEYS.HEARTBEAT_INTERVAL,
    maxMissedHeartbeats: KEYS.HEARTBEAT_MAX_MISSES,
  }),
);

manager.on('clusterCreate', (cluster) => logger.info(`Launched Cluster: ${cluster.id}`));
manager.on('clusterReady', (cluster) => logger.info(`Cluster Ready: ${cluster.id}`));

manager.spawn({ timeout: -1 });
