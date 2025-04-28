import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import type { InfractionSortBy, InfractionSortOrder } from 'types/infraction';

export default new Button({
  customId: 'infractions-custom',
  includeCustomId: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    const targetUserId = interaction.customId.split('_')[1];
    const sortOrder = parseInt(interaction.customId.split('_')[2]) as InfractionSortOrder;
    const sortBy = parseInt(interaction.customId.split('_')[3]) as InfractionSortBy;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId(`infractions-custom_${targetUserId}_${sortOrder}_${sortBy}`)
        .setTitle('Custom Page')
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId('page')
              .setLabel(t('infractions.custom-page-label', { lng: interaction.locale }))
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('1')
              .setRequired(true),
          ),
        ),
    );
  },
});
