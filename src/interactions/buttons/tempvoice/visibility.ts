import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-visibility',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-visibility')
        .setTitle('Manage Visibility of Voice Channel')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('Visibility')
            .setStringSelectMenuComponent(
              new StringSelectMenuBuilder()
                .setCustomId('visibility')
                .setMaxValues(1)
                .addOptions(
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Visible')
                    .setDescription('Channel is visible to everyone in the server')
                    .setValue('visible'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Hidden')
                    .setDescription('Channel is hidden from non-members')
                    .setValue('hidden'),
                ),
            ),
        ),
    );
  },
});
