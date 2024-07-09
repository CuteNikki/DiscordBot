import { ChannelType, EmbedBuilder, Events, type ColorResolvable } from 'discord.js';

import { Event } from 'classes/event';

import { replacePlaceholders } from 'utils/embed';

export default new Event({
  name: Events.GuildMemberAdd,
  once: false,
  async execute(client, member) {
    const { guild, user, partial, pending } = member;
    if (user.bot || pending) return;
    if (partial) await member.fetch().catch(() => {});

    const config = await client.getGuildSettings(guild.id);

    if (!config.welcome.enabled) return;
    await member.roles.add(config.welcome.roles).catch(() => {});

    if (!config.welcome.channelId) return;
    const welcomeChannel = await guild.channels.fetch(config.welcome.channelId);
    if (!welcomeChannel || welcomeChannel.type !== ChannelType.GuildText) return;

    const embedData = config.welcome.message.embed;

    await welcomeChannel
      .send({
        content: replacePlaceholders(config.welcome.message.content ?? '', user, guild),
        embeds: [
          EmbedBuilder.from({
            title: replacePlaceholders(embedData.title ?? '', user, guild),
            author: {
              name: replacePlaceholders(embedData.author?.name ?? '', user, guild),
              icon_url: replacePlaceholders(embedData.author?.icon_url ?? '', user, guild),
              url: replacePlaceholders(embedData.author.url ?? '', user, guild),
            },
            description: replacePlaceholders(embedData.description ?? '', user, guild),
            fields: embedData.fields.map((field) => ({
              name: replacePlaceholders(field.name, user, guild),
              value: replacePlaceholders(field.value ?? '', user, guild),
            })),
            footer: {
              text: replacePlaceholders(embedData.footer?.text ?? '', user, guild),
              icon_url: replacePlaceholders(embedData.footer?.icon_url ?? '', user, guild),
            },
            image: { url: replacePlaceholders(embedData.image ?? '', user, guild) },
            thumbnail: { url: replacePlaceholders(embedData.thumbnail ?? '', user, guild) },
            url: replacePlaceholders(embedData.url ?? '', user, guild),
          }).setColor(embedData.color as ColorResolvable),
        ],
      })
      .catch(() => {});
  },
});
