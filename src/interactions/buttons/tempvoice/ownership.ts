import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-ownership',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-ownership')
        .setTitle('Transfer Channel Ownership')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('New Owner')
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('ownership')
                .setMaxValues(1)
                .setPlaceholder('Select the member to transfer ownership to'),
            ),
        ),
    );
  },
});
