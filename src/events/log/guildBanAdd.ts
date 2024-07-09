import { ChannelType, Colors, EmbedBuilder, Events } from 'discord.js';

import { Event } from 'classes/event';

export default new Event({
  name: Events.GuildBanAdd,
  once: false,
  async execute(client, ban) {
    const { guild, user, reason, partial } = ban;
    if (partial) await ban.fetch().catch(() => {});

    const config = await client.getGuildSettings(guild.id);

    if (!config.log.enabled || !config.log.events.guildBanAdd || !config.log.channelId) return;

    const logChannel = await guild.channels.fetch(config.log.channelId);
    if (!logChannel || logChannel.type !== ChannelType.GuildText) return;

    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle('Guild Ban Add')
          .addFields({ name: 'User', value: `${user.toString()} (\`${user.username}\` | ${user.id})` }, { name: 'Reason', value: reason || '/' }),
      ],
    });
  },
});
