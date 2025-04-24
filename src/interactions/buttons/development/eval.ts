import { Button } from 'classes/base/button';
import { MessageFlags } from 'discord.js';
import { getEvalModal } from 'utility/eval';

export default new Button({
  isDevelopment: true,
  customId: 'eval',
  userPermissions: ['Administrator'],
  async execute(interaction) {
    const message = interaction.message;

    if (!message) {
      await interaction.reply({
        content: '❌ Message not found',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const code = message.embeds[0]?.fields[0]?.value?.replace(/```js\n/g, '').replace(/\n```/g, '');

    if (!code) {
      await interaction.reply({
        content: '❌ Code not found',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const depth = message.embeds[0]?.fields[3]?.value?.replaceAll('`', '');

    await interaction.showModal(getEvalModal(depth, code));
  },
});
