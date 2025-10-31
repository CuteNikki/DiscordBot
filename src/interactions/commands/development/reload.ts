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
        .setChoices(
          { name: 'All', value: ReloadTypeEnum.All },
          { name: 'Interaction (cmds, btns, slcs, mdls)', value: ReloadTypeEnum.Interaction },
          { name: 'Commands', value: ReloadTypeEnum.Commands },
          { name: 'Buttons', value: ReloadTypeEnum.Buttons },
          { name: 'Modals', value: ReloadTypeEnum.Modals },
          { name: 'Selects', value: ReloadTypeEnum.Selects },
          { name: 'Events', value: ReloadTypeEnum.Events },
          { name: 'Locales', value: ReloadTypeEnum.Locales },
        ),
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
