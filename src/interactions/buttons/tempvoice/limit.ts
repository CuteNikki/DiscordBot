import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Button } from 'classes/base/button';

export default new Button({
  customId: 'tempvoice-limit',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild()) return;

    const currentLimit = interaction.channel?.isVoiceBased() ? interaction.channel.userLimit : 0;

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId('tempvoice-limit')
        .setTitle('Set Voice Channel User Limit')
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('User Limit (0 - 99, 0 = Unlimited)')
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId('limit')
                .setValue(currentLimit.toString())
                .setPlaceholder('Enter a number between 0 and 99')
                .setMaxLength(2)
                .setStyle(TextInputStyle.Short)
                .setRequired(true),
            ),
        ),
    );
  },
});
