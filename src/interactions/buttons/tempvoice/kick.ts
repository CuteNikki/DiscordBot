import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-kick',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-kick')
        .setTitle(t('tempvoice.kick.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.kick.modal.label', { lng }))
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('tempvoice-kick')
                .setMaxValues(1)
                .setPlaceholder(t('tempvoice.kick.modal.placeholder', { lng })),
            ),
        ),
    );
  },
});
