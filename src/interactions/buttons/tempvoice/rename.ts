import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-rename',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-rename')
        .setTitle('Rename Temporary Voice Channel')
        .addLabelComponents(
          new LabelBuilder().setLabel('New Channel Name').setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('name')
              .setValue(interaction.channel?.name ?? '')
              .setPlaceholder('Enter a new name for the temporary voice channel')
              .setMaxLength(100)
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        ),
    );
  },
});
