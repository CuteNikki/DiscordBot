import { ChannelType, Colors, EmbedBuilder, Events } from 'discord.js';
import { t } from 'i18next';

import { Event } from 'classes/event';

export default new Event({
  name: Events.GuildEmojiDelete,
  once: false,
  async execute(client, emoji) {
    const { guild, name, id, animated, managed, roles, createdTimestamp, identifier, author } = emoji;

    const config = await client.getGuildSettings(guild.id);

    if (!config.log.enabled || !config.log.events.emojiDelete || !config.log.channelId) return;

    const logChannel = await guild.channels.fetch(config.log.channelId);
    if (!logChannel || logChannel.type !== ChannelType.GuildText) return;

    const lng = config.language;

    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle(t('log.emojiDelete.title', { lng }))
          .setThumbnail(emoji.imageURL({ size: 1024 }))
          .addFields(
            { name: t('log.emojiDelete.emoji', { lng }), value: `\`${name}\` (${id})` },
            { name: t('log.emojiDelete.author', { lng }), value: author ? `${author.toString()} (\`${author.username}\` | ${author.id})` : '/' },
            { name: t('log.emojiDelete.created_at', { lng }), value: `<t:${Math.floor(createdTimestamp / 1000)}:f>` },
            { name: t('log.emojiDelete.identifier', { lng }), value: `\`${identifier}\`` },
            { name: t('log.emojiDelete.animated', { lng }), value: `${animated ?? '/'}` },
            { name: t('log.emojiDelete.managed', { lng }), value: `${managed ?? '/'}` },
            {
              name: t('log.emojiDelete.roles', { lng }),
              value:
                roles.cache
                  .map((role) => role.toString())
                  .join(', ')
                  .slice(0, 1000) || '/',
            }
          )
          .setTimestamp(),
      ],
    });
  },
});
