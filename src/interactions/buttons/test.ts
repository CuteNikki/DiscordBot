import { Button } from 'classes/base/button';

export default new Button({
  customId: 'test',
  execute(interaction) {
    interaction.reply({
      content: 'Test button executed!',
    });
  },
});
