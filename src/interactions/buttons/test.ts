import { Button } from 'classes/base/button';

export default new Button({
  customId: 'test',
  includeCustomId: true, // Allow test_2 to still run this button
  execute(interaction) {
    interaction.reply({
      content: 'Test button executed!',
    });
  },
});
