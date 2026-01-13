import { ChatInputCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Command } from 'classes/base/command';

import { logger } from 'utility/logger';

import { isValidComponent, reloadMap, ReloadTypeEnum } from 'types/reload';

export default new Command({
  isDevelopment: true,
  builder: new ChatInputCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('reload')
    .setDescription('Reloads interactions and event handlers')
    .addStringOptions((option) =>
      option
        .setName('type')
        .setDescription('Type of file to reload')
        .setRequired(true)
        .setChoices(Object.entries(ReloadTypeEnum).map(([key, val]) => ({ name: key, value: val }))),
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const type = interaction.options.getString('type') ?? ReloadTypeEnum.All;
    const client = interaction.client as ExtendedClient;

    if (!isValidComponent(type)) {
      return await interaction.editReply({
        content: `❌ Invalid type: \`${type}\``,
      });
    }

    try {
      const loader = reloadMap[type];
      await loader(client);

      await interaction.editReply({ content: `✅ Reloaded ${type}.` });
    } catch (err) {
      await interaction.editReply({
        content: `❌ Failed to reload ${type}. Check the logs for more details.`,
      });
      logger.error({ err }, `Failed to reload ${type}`);
    }
  },
});
