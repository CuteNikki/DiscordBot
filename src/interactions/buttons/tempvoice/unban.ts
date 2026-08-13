import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-unban',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-unban')
        .setTitle('Unban User from Voice Channel')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('User to Unban')
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder()
                .setCustomId('unban')
                .setMaxValues(1)
                .setPlaceholder('Select a user to unban from the channel'),
            ),
        ),
    );
  },
});
