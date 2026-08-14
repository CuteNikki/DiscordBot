import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-ownership',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-ownership')
        .setTitle(t('tempvoice.ownership.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.ownership.modal.label', { lng }))
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('ownership')
                .setMaxValues(1)
                .setPlaceholder(t('tempvoice.ownership.modal.placeholder', { lng })),
            ),
        ),
    );
  },
});
