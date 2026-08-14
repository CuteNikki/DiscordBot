import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-access',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-access')
        .setTitle(t('tempvoice.access.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder().setLabel(t('tempvoice.access.modal.label', { lng })).setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
              .setCustomId('access')
              .setMaxValues(1)
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(t('tempvoice.access.modal.private', { lng }))
                  .setDescription(t('tempvoice.access.modal.private-description', { lng }))
                  .setValue('private'),
                new StringSelectMenuOptionBuilder()
                  .setLabel(t('tempvoice.access.modal.public', { lng }))
                  .setDescription(t('tempvoice.access.modal.public-description', { lng }))
                  .setValue('public'),
              ),
          ),
        ),
    );
  },
});
