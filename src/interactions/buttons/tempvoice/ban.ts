import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-ban',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-ban')
        .setTitle('Ban User from Voice Channel')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('User to Ban')
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('ban')
                .setMaxValues(1)
                .setPlaceholder('Select a user to ban from the channel'),
            ),
        ),
    );
  },
});
