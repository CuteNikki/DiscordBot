import { LabelBuilder, ModalBuilder, UserSelectMenuBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-invite',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-invite')
        .setTitle('Invite User to Voice Channel')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('User to Invite')
            .setUserSelectMenuComponent(
              new UserSelectMenuBuilder().setCustomId('invite').setMaxValues(1).setPlaceholder('Select a user to invite'),
            ),
        ),
    );
  },
});
