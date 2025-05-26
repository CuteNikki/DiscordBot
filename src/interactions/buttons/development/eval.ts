import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getEvalModal } from 'utility/eval';

export default new Button({
  isDevelopment: true,
  customId: 'eval',
  userPermissions: ['Administrator'],
  async execute(interaction) {
    const message = interaction.message;

    if (!message) {
      await interaction.reply({
        content: t('eval.no-message', { lng: interaction.locale }),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const code = message.embeds[0]?.description?.replace(/```js\n/g, '').replace(/\n```/g, '');

    if (!code) {
      await interaction.reply({
        content: t('eval.no-message', { lng: interaction.locale }),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const depth = message.embeds[0]?.fields[2]?.value?.replaceAll('`', '');

    await interaction.showModal(getEvalModal(interaction.locale, depth, code));
  },
});
