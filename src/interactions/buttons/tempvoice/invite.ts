import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-invite',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;
    const lng = interaction.locale;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-invite')
        .setTitle(t('tempvoice.invite.modal.title', { lng }))
        .addLabelComponents(
          new LabelBuilder()
            .setLabel(t('tempvoice.invite.modal.label', { lng }))
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('invite')
                .setMaxValues(1)
                .setPlaceholder(t('tempvoice.invite.modal.placeholder', { lng })),
            ),
        ),
    );
  },
});
