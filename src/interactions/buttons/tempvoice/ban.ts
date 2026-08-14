import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-ban',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-ban')
        .setTitle(t('tempvoice.ban.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.ban.modal.label', { lng }))
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder().setCustomId('ban').setMaxValues(1).setPlaceholder(t('tempvoice.ban.modal.placeholder', { lng })),
            ),
        ),
    );
  },
});
