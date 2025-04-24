import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { evaluateCode } from 'utility/eval';

export default new Modal({
  isDevelopment: true,
  customId: 'eval',
  userPermissions: ['Administrator'],
  async execute(interaction) {
    await interaction.deferReply();

    const code = interaction.fields.getTextInputValue('code');
    const depth = parseInt(interaction.fields.getTextInputValue('depth') || '0', 10);

    if (isNaN(depth)) {
      await interaction.editReply({
        content: t('eval.invalid-depth', { lng: interaction.locale }),
      });
      return;
    }

    await evaluateCode(interaction, code, depth);
  },
});
