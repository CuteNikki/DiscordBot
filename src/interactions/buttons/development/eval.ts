import { Colors, ContainerBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { getEvalModal } from 'utility/eval';

export default new Button({
  isDevelopment: true,
  customId: 'eval',
  userPermissions: ['Administrator'],
  async execute(interaction) {
    const message = interaction.message;

    const noMessageComponent = new ContainerBuilder()
      .setAccentColor(Colors.Red)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('eval.no-message', { lng: interaction.locale })));

    if (!message) {
      await interaction.reply({
        components: [noMessageComponent],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const code = message.embeds[0]?.description?.replace(/```js\n/g, '').replace(/\n```/g, '');

    if (!code) {
      await interaction.reply({
        components: [noMessageComponent],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const depth = message.embeds[0]?.fields[2]?.value?.replaceAll('`', '');

    if (!depth || isNaN(Number(depth))) {
      await interaction.reply({
        components: [noMessageComponent],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.showModal(getEvalModal(interaction.locale, depth, code));
  },
});
