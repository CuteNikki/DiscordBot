import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-kick',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-kick')
        .setTitle('Kick User from Voice Channel')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('User to Kick')
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('tempvoice-kick')
                .setMaxValues(1)
                .setPlaceholder('Select a user to kick from the channel'),
            ),
        ),
    );
  },
});
