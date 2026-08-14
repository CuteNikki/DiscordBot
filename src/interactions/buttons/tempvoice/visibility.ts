import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-visibility',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-visibility')
        .setTitle(t('tempvoice.visibility.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.visibility.modal.label', { lng }))
            .setStringSelectMenuComponent(
              new StringSelectMenuBuilder()
                .setCustomId('visibility')
                .setMaxValues(1)
                .addOptions(
                  new StringSelectMenuOptionBuilder()
                    .setLabel(t('tempvoice.visibility.modal.visible', { lng }))
                    .setDescription(t('tempvoice.visibility.modal.visible-description', { lng }))
                    .setValue('visible'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel(t('tempvoice.visibility.modal.hidden', { lng }))
                    .setDescription(t('tempvoice.visibility.modal.hidden-description', { lng }))
                    .setValue('hidden'),
                ),
            ),
        ),
    );
  },
});
