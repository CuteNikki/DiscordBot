import { ChannelType, Colors, EmbedBuilder, Events } from 'discord.js';
import { t } from 'i18next';

import { Event } from 'classes/event';

import { getGuild } from 'db/guild';
import { getGuildLanguage } from 'db/language';

export default new Event({
  name: Events.ChannelDelete,
  once: false,
  async execute(_client, channel) {
    if (channel.isDMBased()) return;
    const { guild, name, id, type, parent, createdTimestamp, permissionOverwrites } = channel;

    const config = (await getGuild(guild.id)) ?? { log: { enabled: false } };

    if (!config.log.enabled || !config.log.events.channelCreate || !config.log.channelId) return;

    const logChannel = await guild.channels.fetch(config.log.channelId);
    if (!logChannel?.isSendable()) return;

    const lng = await getGuildLanguage(guild.id);

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle(t('log.channelDelete.title', { lng }))
      .addFields(
        {
          name: t('log.channelDelete.channel', { lng }),
          value: `${channel.toString()} (\`${name}\` | ${id})`
        },
        {
          name: t('log.channelDelete.type', { lng }),
          value: ChannelType[type]
        },
        {
          name: t('log.channelDelete.created-at', { lng }),
          value: `<t:${Math.floor(createdTimestamp / 1000)}:f>`
        },
        {
          name: t('log.channelDelete.permission-overwrites', { lng }),
          value:
            permissionOverwrites.cache
              .map(
                (permission) =>
                  `<@${permission.type ? '' : '&'}${permission.id}>${
                    permission.allow.toArray().length
                      ? `\n- ${t('log.channelDelete.allowed', { lng })}: ` +
                        permission.allow
                          .toArray()
                          .map((perm) => `\`${perm}\``)
                          .join(', ')
                      : ''
                  }${
                    permission.deny.toArray().length
                      ? `\n- ${t('log.channelDelete.denied', { lng })}: ` +
                        permission.deny
                          .toArray()
                          .map((perm) => `\`${perm}\``)
                          .join(', ')
                      : ''
                  }`
              )
              .join('\n')
              .slice(0, 1000) || '/'
        }
      )
      .setTimestamp();

    if (parent)
      embed.addFields({
        name: t('log.channelDelete.category', { lng }),
        value: `\`${parent.name}\` (${parent.id})`
      });

    await logChannel.send({
      embeds: [embed]
    });
  }
});
