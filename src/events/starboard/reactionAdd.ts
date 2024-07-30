import { ChannelType, EmbedBuilder, Events, PermissionsBitField } from 'discord.js';

import { Event } from 'classes/event';

import { logger } from 'utils/logger';

export default new Event({
  name: Events.MessageReactionAdd,
  async execute(client, reaction, user) {
    if (reaction.partial) await reaction.fetch().catch((error) => logger.debug(error, 'Could not fetch reaction'));
    if (reaction.emoji.name !== '⭐' || user.bot) return;

    const guild = reaction.message.guild;
    if (!guild || !guild.members.me) return;

    const config = await client.getGuildSettings(guild.id);
    if (!config.starboard.enabled || !config.starboard.channelId || !config.starboard.minimumStars) return;

    if (reaction.message.partial) await reaction.message.fetch().catch((error) => logger.debug(error, 'Could not fetch message'));

    const channel = guild.channels.cache.get(config.starboard.channelId);
    if (!channel || channel.type !== ChannelType.GuildText || !channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)) return;

    let knownMessage = config.starboard.messages.find((message) => message.messageId === reaction.message.id);
    const knownStarboardMessage = config.starboard.messages.find((message) => message.starboardMessageId === reaction.message.id);

    if (!knownMessage && !knownStarboardMessage) {
      await client.updateGuildSettings(guild.id, {
        $push: {
          ['starboard.messages']: {
            messageId: reaction.message.id,
            reactedUsers: [user.id],
          },
        },
      });
      knownMessage = { messageId: reaction.message.id, reactedUsers: [user.id] };
    }

    if (knownMessage) {
      let stars = knownMessage.reactedUsers.length;
      if (!knownMessage.reactedUsers.includes(user.id)) {
        stars += 1;
        await client.updateGuildSettings(guild.id, {
          $set: {
            ['starboard.messages']: [
              ...config.starboard.messages.filter((msg) => msg.messageId !== knownMessage?.messageId),
              {
                ...knownMessage,
                reactedUsers: [...knownMessage.reactedUsers, user.id],
              },
            ],
          },
        });
        knownMessage = { ...knownMessage, reactedUsers: [...knownMessage.reactedUsers, user.id] };
      }

      if (knownMessage.starboardMessageId) {
        const msg = await channel.messages
          .edit(knownMessage.starboardMessageId, { content: `${stars} ⭐` })
          .catch((error) => logger.debug(error, 'Could not edit starboard message'));
        if (!msg) {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: reaction.message.author?.displayName || 'Unknown User',
              iconURL: reaction.message.author?.displayAvatarURL(),
              url: reaction.message.url,
            })
            .setTimestamp(reaction.message.createdAt);
          const attachment = reaction.message.attachments.first();
          if (attachment && attachment.contentType && (attachment.contentType.startsWith('image/') || attachment.contentType.startsWith('video/')))
            embed.setImage(attachment.url);
          if (reaction.message.content?.length) embed.setDescription(reaction.message.content);

          const msg = await channel.send({
            content: `${stars} ⭐`,
            embeds: [embed],
          });
          if (msg) await msg.react('⭐').catch((error) => logger.debug(error, 'Could not react to starboard message'));

          await client.updateGuildSettings(guild.id, {
            $set: {
              ['starboard.messages']: [
                ...config.starboard.messages.filter((msg) => msg.messageId !== reaction.message.id),
                {
                  ...knownMessage,
                  starboardMessageId: msg?.id,
                },
              ],
            },
          });
        }
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: reaction.message.author?.displayName || 'Unknown User',
            iconURL: reaction.message.author?.displayAvatarURL(),
            url: reaction.message.url,
          })
          .setTimestamp(reaction.message.createdAt);
        const attachment = reaction.message.attachments.first();
        if (attachment && attachment.contentType && (attachment.contentType.startsWith('image/') || attachment.contentType.startsWith('video/')))
          embed.setImage(attachment.url);
        if (reaction.message.content?.length) embed.setDescription(reaction.message.content);

        const msg = await channel
          .send({
            content: `${stars} ⭐`,
            embeds: [embed],
          })
          .catch((error) => logger.debug(error, 'Could not send starboard message'));
        if (msg) await msg.react('⭐').catch((error) => logger.debug(error, 'Could not react to starboard message'));

        await client.updateGuildSettings(guild.id, {
          $set: {
            ['starboard.messages']: [
              ...config.starboard.messages.filter((msg) => msg.messageId !== reaction.message.id),
              {
                ...knownMessage,
                starboardMessageId: msg?.id,
              },
            ],
          },
        });
      }
    }
    if (knownStarboardMessage && knownStarboardMessage.starboardMessageId) {
      let stars = knownStarboardMessage.reactedUsers.length;
      if (!knownStarboardMessage.reactedUsers.includes(user.id)) {
        stars += 1;
        await client.updateGuildSettings(guild.id, {
          $set: {
            ['starboard.messages']: [
              ...config.starboard.messages.filter((msg) => msg.messageId !== knownStarboardMessage.messageId),
              {
                ...knownStarboardMessage,
                reactedUsers: [...knownStarboardMessage.reactedUsers, user.id],
              },
            ],
          },
        });
      }

      return await channel.messages
        .edit(knownStarboardMessage.starboardMessageId, { content: `${stars} ⭐` })
        .catch((error) => logger.debug(error, 'Could not edit starboard message'));
    }
  },
});
