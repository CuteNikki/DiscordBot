import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { Command } from 'classes/base/command';

import { evaluateCode, getEvalModal } from 'utility/eval';

export default new Command({
  isDevelopment: true,
  builder: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('eval')
    .setDescription('Evaluate JavaScript code')
    .addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setMaxLength(1900).setRequired(false))
    .addNumberOption((option) =>
      option.setName('depth').setDescription('Depth of inspection').setMinValue(0).setMaxValue(99).setRequired(false),
    ),
  async execute(interaction) {
    const code = interaction.options.getString('code');
    const depth = interaction.options.getNumber('depth') || 0;

    if (!code) {
      await interaction.showModal(getEvalModal(depth));
      return;
    }

    await interaction.deferReply();
    await evaluateCode(interaction, code, depth);
  },
});
