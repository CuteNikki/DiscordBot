import { SelectMenu } from 'classes/base/select';

export default new SelectMenu({
  customId: 'select',
  cooldown: 0,
  execute(interaction) {
    const selectedOptions = interaction.values;

    interaction.reply({
      content: 'Test select menu executed: ' + selectedOptions.join(', '),
    });
  },
});
