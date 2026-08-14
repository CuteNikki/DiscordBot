import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-rename',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-rename')
        .setTitle(t('tempvoice.rename.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder().setLabel(t('tempvoice.rename.modal.label', { lng })).setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('name')
              .setValue(interaction.channel?.name ?? '')
              .setPlaceholder(t('tempvoice.rename.modal.placeholder', { lng }))
              .setMaxLength(100)
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        ),
    );
  },
});
