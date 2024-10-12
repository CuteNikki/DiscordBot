import { Colors, EmbedBuilder, Events } from 'discord.js';
import { t } from 'i18next';

import { Event } from 'classes/event';

import { getGuild } from 'db/guild';
import { getGuildLanguage } from 'db/language';

import { logger } from 'utils/logger';

export default new Event({
  name: Events.GuildScheduledEventUserAdd,
  once: false,
  async execute(_client, event, user) {
    if (event.partial) await event.fetch().catch((err) => logger.debug({ err }, 'Could not fetch guild scheduled event'));
    const guild = event.guild;
    if (!guild) return;

    const config = (await getGuild(guild.id)) ?? { log: { enabled: false } };

    if (!config.log.enabled || !config.log.events.guildScheduledEventUserAdd || !config.log.channelId) return;

    const logChannel = await guild.channels.fetch(config.log.channelId);
    if (!logChannel?.isSendable()) return;

    const lng = await getGuildLanguage(guild.id);

    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle(t('log.guildScheduledEventUserAdd.title', { lng }))
          .setImage(event.coverImageURL({ size: 1024 }))
          .addFields(
            {
              name: t('log.guildScheduledEventUserAdd.event', { lng }),
              value: `[${event.name}](${event.url})`
            },
            {
              name: t('log.guildScheduledEventUserAdd.user', { lng }),
              value: `${user.toString()} (\`${user.username}\` | ${user.id})`
            }
          )
          .setTimestamp()
      ]
    });
  }
});
