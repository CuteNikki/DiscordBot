import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-limit',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    const currentLimit = interaction.channel?.isVoiceBased() ? interaction.channel.userLimit : 0;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-limit')
        .setTitle(t('tempvoice.limit.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.limit.modal.label', { lng }))
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId('limit')
                .setValue(currentLimit.toString())
                .setPlaceholder(t('tempvoice.limit.modal.placeholder', { lng }))
                .setMaxLength(2)
                .setStyle(TextInputStyle.Short)
                .setRequired(true),
            ),
        ),
    );
  },
});
