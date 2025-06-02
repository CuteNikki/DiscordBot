import { Colors, ContainerBuilder, MessageFlags, TextDisplayBuilder, userMention } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { deleteInfraction, getInfractionById } from 'database/infraction';

export default new Button({
  customId: 'infractions-delete',
  includeCustomId: true,
  userPermissions: ['ModerateMembers'],
  async execute(interaction) {
    const infractionId = interaction.customId.split('_')[1];

    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        components: [
          new ContainerBuilder()
            .setAccentColor(Colors.Red)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.guild-only', { lng: interaction.locale }))),
        ],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const infraction = await getInfractionById(infractionId).catch(() => null);

    if (!infraction || infraction.guildId !== interaction.guildId) {
      await interaction.editReply({
        components: [
          new ContainerBuilder()
            .setAccentColor(Colors.Red)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(t('infractions.not-found', { lng: interaction.locale, infractionId })),
            ),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await deleteInfraction(infractionId).catch(() => null);
    await interaction.editReply({
      components: [
        new ContainerBuilder()
          .setAccentColor(Colors.Green)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              t('infractions.deleted', { lng: interaction.locale, infractionId, targetUser: userMention(infraction.userId) }),
            ),
          ),
      ],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
});
