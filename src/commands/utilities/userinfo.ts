import { ActivityType, ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder, Role } from 'discord.js';
import i18next from 'i18next';

import { Command, Contexts, IntegrationTypes } from 'classes/command';

export default new Command({
  data: {
    name: 'userinfo',
    description: 'Get information about a user',
    type: ApplicationCommandType.ChatInput,
    contexts: [Contexts.GUILD, Contexts.BOT_DM, Contexts.PRIVATE_CHANNEL],
    integration_types: [IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL],
    options: [
      {
        name: 'user',
        description: 'User to get the information about',
        type: ApplicationCommandOptionType.User,
      },
      {
        name: 'ephemeral',
        description: 'When set to false will show the message to everyone',
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
  async execute({ interaction, client }) {
    const lng = await client.getLanguage(interaction.user.id);
    const ephemeral = interaction.options.getBoolean('ephemeral', false) ?? true;
    await interaction.deferReply({ ephemeral });

    try {
      const user = await client.users.fetch(interaction.options.getUser('user', false) ?? interaction.user, { force: true });
      if (!user) return interaction.editReply({ content: i18next.t('userinfo.user', { lng }) });

      const flags = user.flags?.toArray() ?? [];

      const embeds: EmbedBuilder[] = [];

      const userEmbed = new EmbedBuilder()
        .setColor(Colors.Aqua)
        .setThumbnail(user.displayAvatarURL({ size: 4096 }))
        .setTitle(i18next.t('userinfo.user_embed_title', { lng }))
        .addFields(
          {
            name: i18next.t('userinfo.user_title', { lng }),
            value: [`${user} (${user.username}/${user.id})`].join('\n'),
          },
          { name: i18next.t('userinfo.created_at', { lng }), value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` }
        )
        .setImage(user.bannerURL({ size: 4096 }) ?? null);
      if (flags.length) userEmbed.addFields({ name: i18next.t('userinfo.badges', { lng }), value: flags.map((v) => `\`${v}\``).join(' ') });
      if (user.banner) userEmbed.addFields({ name: i18next.t('userinfo.banner', { lng }), value: '** **' });

      embeds.push(userEmbed);

      const member = await interaction.guild?.members.fetch(user.id);

      if (member) {
        const activities = ['playing', 'streaming', 'listening to', 'watching', 'custom', 'competing in'];
        const devices = Object.entries(member.presence?.clientStatus ?? {}).map(([key]) => `${key}`);

        const statusImage = {
          idle: 'https://i.ibb.co/tB36GNW/undefined-Imgur.png',
          dnd: 'https://i.ibb.co/SPqGC4P/undefined-Imgur-1.png',
          online: 'https://i.ibb.co/pnnTZhK/undefined-Imgur-2.png',
          offline: 'https://i.ibb.co/bQDDfBw/undefined-Imgur-3.png',
          invisible: 'https://i.ibb.co/bQDDfBw/undefined-Imgur-3.png',
        };

        const roles = member.roles.cache
          .toJSON()
          .sort((a, b) => b.position - a.position)
          .slice(0, member.roles.cache.size);

        function maxDisplayRoles(roles: Role[]) {
          const results: string[] = [];
          let totalLength = 0;
          for (const role of roles) {
            const roleString = `<@&${role.id}> `;
            if (roleString.length + totalLength > 1000) break;
            results.push(roleString);
          }
          return results;
        }

        const memberEmbed = new EmbedBuilder()
          .setColor(Colors.Aqua)
          .setThumbnail(member.avatarURL({ size: 4096 }))
          .setAuthor({
            name: i18next.t('userinfo.member_embed_title', { lng }),
            iconURL: statusImage[member.presence?.status ?? 'offline'],
          })
          .addFields({ name: i18next.t('userinfo.joined_at', { lng }), value: `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:R>` });
        if (member.presence?.activities.length)
          memberEmbed.addFields({
            name: i18next.t('userinfo.activities', { lng }),
            value: member.presence.activities
              .map((activity) => {
                if (activity.type === ActivityType.Custom) return;
                else return `${activities[activity.type]} ${activity.name}`;
              })
              .join('\n'),
          });
        if (devices.length)
          memberEmbed.addFields({
            name: i18next.t('userinfo.devices', { lng }),
            value: devices.join(', '),
          });
        if (member.premiumSinceTimestamp)
          memberEmbed.addFields({
            name: i18next.t('userinfo.boosting', { lng }),
            value: `<t:${Math.floor(member.premiumSinceTimestamp ?? 0 / 1000)}:R>`,
          });
        const displayRoles = maxDisplayRoles(roles);
        if (roles.length)
          memberEmbed.addFields({
            name: i18next.t('userinfo.roles', { lng, showing: roles.length, total: displayRoles.length }),
            value: displayRoles.join(''),
          });

        embeds.push(memberEmbed);
      }

      interaction.editReply({ embeds });
    } catch (err) {
      interaction.editReply({ content: i18next.t('userinfo.failed', { lng }) });
    }
  },
});
