// @todo: add translations

import { Modal } from 'classes/base/modal';

export default new Modal({
  customId: 'test',
  execute(interaction) {
    const inputValue = interaction.components.getTextInputValue('test');

    interaction.reply({
      content: `Test modal executed! Input value: ${inputValue}`,
    });
  },
});
