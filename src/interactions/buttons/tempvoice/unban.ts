import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-unban',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-unban')
        .setTitle(t('tempvoice.unban.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.unban.modal.label', { lng }))
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('unban')
                .setMaxValues(1)
                .setPlaceholder(t('tempvoice.unban.modal.placeholder', { lng })),
            ),
        ),
    );
  },
});
