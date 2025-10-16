import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'modal',
  execute(interaction) {
    interaction.showModal(
      new ModalBuilder()
        .setCustomId('test')
        .setTitle('Test Modal')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('Test Input')
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId('test')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter something here')
                .setRequired(true),
            ),
        ),
    );
  },
});
