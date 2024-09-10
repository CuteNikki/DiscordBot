import { ApplicationIntegrationType, Colors, EmbedBuilder, InteractionContextType, Role, SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Command, ModuleType } from 'classes/command';

import { logger } from 'utils/logger';

export default new Command({
  module: ModuleType.Utilities,
  botPermissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addUserOption((option) => option.setName('user').setDescription('User to get the information about').setRequired(false))
    .addBooleanOption((option) => option.setName('ephemeral').setDescription('When set to false will show the message to everyone').setRequired(false)),
  async execute({ interaction, client }) {
    const lng = await client.getUserLanguage(interaction.user.id);
    const ephemeral = interaction.options.getBoolean('ephemeral', false) ?? true;
    await interaction.deferReply({ ephemeral });

    const user = await client.users
      .fetch(interaction.options.getUser('user', false) ?? interaction.user, {
        force: true,
      })
      .catch((err) => logger.debug({ err }, 'Could not fetch user'));
    if (!user) return interaction.editReply({ content: t('userinfo.user', { lng }) });

    const member = await interaction.guild?.members.fetch(user.id).catch((err) => logger.debug({ err, userId: user.id }, 'Could not fetch member'));

    const badges = user.flags?.toArray() ?? [];
    const badgeMap = {
      Staff: '<:discord_employee:1282608559598731355>', // Discord Employee
      Partner: '<:discord_partner:1282605934740373576>', // Partnered Server Owner
      Hypesquad: '<:hypesquad:1282605969414557736>', // HypeSquad Events Member
      BugHunterLevel1: '<:bughunter:1282605916427915317>', // Bug Hunter Level 1
      MFASMS: 'MFASMS', // @unstable This user flag is currently not documented by Discord but has a known value
      PremiumPromoDismissed: 'PremiumPromoDismissed', // @unstable This user flag is currently not documented by Discord but has a known value
      HypeSquadOnlineHouse1: '<:bravery:1282606035181375508>', // House Bravery Member
      HypeSquadOnlineHouse2: '<:brilliance:1282606020060778497>', // House Brilliance Member
      HypeSquadOnlineHouse3: '<:balance:1282605951366729768>', // House Balance Member
      PremiumEarlySupporter: '<:early_supporter:1282605986179190846>', // Early Nitro Supporter
      TeamPseudoUser: 'TeamPseudoUser', // User is a [team](https://discord.com/developers/docs/topics/teams)
      HasUnreadUrgentMessages: 'HasUnreadUrgentMessages', // @unstable This user flag is currently not documented by Discord but has a known value
      BugHunterLevel2: '<:bughunter_two:1282605894789632012>', // Bug Hunter Level 2
      VerifiedBot: '<:verified_app_one:1282613412488024084><:verified_app_two:1282613389612421151><:verified_app_three:1282613434843791421>', // Verified Bot
      VerifiedDeveloper: '<:verified_bot_developer:1282608164432248944>', // Early Verified Bot Developer
      CertifiedModerator: '<:alumni:1282609017213943871>', // Moderator Programs Alumni
      BotHTTPInteractions: '<:bot_http_interactions:1282630582228090910>', // Bot uses only [HTTP interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction) and is shown in the online member list
      Spammer: 'Spammer', // User has been identified as spammer @unstable This user flag is currently not documented by Discord but has a known value
      DisablePremium: 'DisablePremium', // @unstable This user flag is currently not documented by Discord but has a known value
      ActiveDeveloper: '<:active_developer:1282608484667621399>', // User is an [Active Developer](https://support-dev.discord.com/hc/articles/10113997751447)
      Quarantined: 'Quarantined', // User's account has been [quarantined](https://support.discord.com/hc/articles/6461420677527) based on recent activity @unstable This user flag is currently not documented by Discord but has a known value. This value would be 1 << 44, but bit shifting above 1 << 30 requires bigints
      Collaborator: 'Collaborator', // @unstable This user flag is currently not documented by Discord but has a known value. This value would be 1 << 50, but bit shifting above 1 << 30 requires bigints
      RestrictedCollaborator: 'RestrictedCollaborator', // @unstable This user flag is currently not documented by Discord but has a known value. This value would be 1 << 51, but bit shifting above 1 << 30 requires bigints
    };

    const userEmbed = new EmbedBuilder()
      .setColor(user.accentColor ?? Colors.Aqua)
      .setThumbnail(user.displayAvatarURL({ size: 4096, extension: 'webp' }))
      .addFields(
        {
          name: `\` ${t('userinfo.user_title', { lng })} \``,
          value: [`${user} | \` @${user.username} \``, `\` ${user.id} \``].join('\n'),
        },
        {
          name: `\` ${t('userinfo.created_at', { lng })} \``,
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:d> | <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
        },
      );
    if (badges.length || user.bot) {
      userEmbed.addFields({
        name: `\` ${t('userinfo.badges', { lng })} \``,
        value:
          !badges.includes('VerifiedBot') && user.bot
            ? ['<:app_one:1282613522647351307><:app_two:1282613494864154624>', ...badges.map((v) => badgeMap[v])].join(' ')
            : badges.map((v) => badgeMap[v]).join(' '),
      });
    }
    if (user.banner) {
      userEmbed
        .addFields({ name: `\` ${t('userinfo.banner', { lng })} \``, value: '** **' })
        .setImage(user.bannerURL({ size: 4096, extension: 'webp' }) ?? null);
    }

    if (!member) return interaction.editReply({ embeds: [userEmbed] });

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

    const roles = member.roles.cache
      .map((r) => r)
      .sort((a, b) => b.position - a.position)
      .slice(0, member.roles.cache.size - 1);

    const memberEmbed = new EmbedBuilder()
      .setColor(member.displayColor ?? Colors.Aqua)
      .setThumbnail(member.avatarURL({ size: 4096, extension: 'webp' }))
      .addFields({
        name: `\` ${t('userinfo.joined_at', { lng })} \``,
        value: `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:d> | <t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:R>`,
      });
    if (member.premiumSinceTimestamp) {
      memberEmbed.addFields({
        name: `\` ${t('userinfo.boosting', { lng })} \``,
        value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:d> | <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`,
      });
    }
    if (roles.length) {
      const displayRoles = maxDisplayRoles(roles);
      memberEmbed.addFields({
        name: `\` ${t('userinfo.roles', {
          lng,
          showing: roles.length,
          total: displayRoles.length,
        })} \``,
        value: displayRoles.join(''),
      });
    }

    return interaction.editReply({ embeds: [userEmbed, memberEmbed] });

    //   const activities = [
    //     t('userinfo.activity.playing', { lng }),
    //     t('userinfo.activity.streaming', { lng }),
    //     t('userinfo.activity.listening', { lng }),
    //     t('userinfo.activity.watching', { lng }),
    //     t('userinfo.activity.custom', { lng }),
    //     t('userinfo.activity.competing', { lng }),
    //   ];
    //   const devices = Object.entries(member.presence?.clientStatus ?? {}).map(([key]) => `${key}`);
    //   const statusImage = {
    //     idle: 'https://i.ibb.co/tB36GNW/undefined-Imgur.png',
    //     dnd: 'https://i.ibb.co/SPqGC4P/undefined-Imgur-1.png',
    //     online: 'https://i.ibb.co/pnnTZhK/undefined-Imgur-2.png',
    //     offline: 'https://i.ibb.co/bQDDfBw/undefined-Imgur-3.png',
    //     invisible: 'https://i.ibb.co/bQDDfBw/undefined-Imgur-3.png',
    //   };
    //   {
    //     name: t('userinfo.activities', { lng }),
    //     value:
    //       member.presence?.activities
    //         ?.map((activity) => {
    //           if (activity.type === ActivityType.Custom) return;
    //             else return `${activities[activity.type]} ${activity.name}`;
    //           })
    //         .join('\n') || '/',
    //   },
    //   {
    //     name: t('userinfo.devices', { lng }),
    //     value: devices?.join(', ') || '/',
    //   }
  },
});
