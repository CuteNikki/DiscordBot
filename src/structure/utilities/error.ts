import { codeBlock, Colors, EmbedBuilder, Events, WebhookClient } from 'discord.js';
import mongoose from 'mongoose';

import type { DiscordClient } from 'classes/client';

import { keys } from 'utils/keys';
import { logger } from 'utils/logger';

const webhookUrl = keys.DEVELOPER_ERROR_WEBHOOK;

export async function sendError({
  client,
  location,
  err,
  reason,
  promise,
  url,
}: {
  client: DiscordClient;
  location: string;
  reason?: string;
  err?: Error;
  promise?: Promise<any>;
  url?: string;
}) {
  logger.error({ location, err, reason, promise }, `[${client.cluster.id}] An error occurred`);

  if (!webhookUrl) return;
  const webhook = new WebhookClient({ url: webhookUrl });
  const embed = new EmbedBuilder().setColor(Colors.Red);

  if (err)
    embed
      .setTitle('An error occurred')
      .setURL(url ?? null)
      .setDescription(codeBlock('ts', `Stack: ${err.stack ? (err.stack.length > 3500 ? err.stack.slice(0, 3500) + '...' : err.stack) : 'not available'}`))
      .addFields(
        { name: 'Name', value: `\`${err.name}\`` },
        { name: 'Message', value: `\`${err.message}\`` },
        { name: 'Location', value: `\`${location}\`` },
        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
      );
  if (reason)
    embed
      .setDescription(`Reason: ${reason}`)
      .addFields({ name: 'Location', value: location }, { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>` });

  await webhook
    .send({
      username: `${client.user?.username} | Error` ?? 'Error Notification',
      avatarURL: client.user?.displayAvatarURL(),
      embeds: [embed],
    })
    .catch((err) => logger.error({ err }, 'Could not send error to webhook'));
}

export async function listenToErrors(client: DiscordClient) {
  client.on(Events.Error, (err) =>
    sendError({
      client,
      err,
      location: 'DiscordJS Client Error',
      url: 'https://discordjs.guide/popular-topics/errors.html#api-errors',
    }),
  );
  client.on(Events.ShardError, (err) =>
    sendError({
      client,
      err,
      location: 'DiscordJS Shard Error',
      url: 'https://discordjs.guide/popular-topics/errors.html#api-errors',
    }),
  );
  process.on('uncaughtException', (err) =>
    sendError({
      client,
      err,
      location: 'NodeJS Uncaught Exception',
      url: 'https://nodejs.org/api/process.html#event-uncaughtexception',
    }),
  );
  process.on('uncaughtExceptionMonitor', (err) =>
    sendError({
      client,
      err,
      location: 'NodeJS Uncaught Exception Monitor',
      url: 'https://nodejs.org/api/process.html#event-uncaughtexceptionmonitor',
    }),
  );
  process.on('unhandledRejection', (reason: any, promise) =>
    sendError({
      client,
      reason,
      promise,
      location: 'NodeJS Unhandled Rejection',
      url: 'https://nodejs.org/api/process.html#event-unhandledrejection',
    }),
  );
  process.on('warning', (err) =>
    sendError({
      client,
      err,
      location: 'NodeJS Warning',
      url: 'https://nodejs.org/api/process.html#event-warning',
    }),
  );
  // @ts-ignore - this code works fine, typescript is just being dumb
  mongoose.connection.on('error', (err) =>
    sendError({
      client,
      err,
      location: 'Mongoose Connection Error',
      url: 'https://mongoosejs.com/docs/api/error.html',
    }),
  );
}
