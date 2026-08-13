import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-access',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-access')
        .setTitle('Manage Access to Voice Channel')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('Access')
            .setStringSelectMenuComponent(
              new StringSelectMenuBuilder()
                .setCustomId('access')
                .setMaxValues(1)
                .addOptions(
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Private')
                    .setDescription('Channel only accessible by invited users')
                    .setValue('private'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Public')
                    .setDescription('Channel accessible by everyone')
                    .setValue('public'),
                ),
            ),
        ),
    );
  },
});
