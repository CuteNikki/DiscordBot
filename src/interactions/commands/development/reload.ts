import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Command } from 'classes/base/command';

import logger from 'utility/logger';

import { reloadableTypes, typeLabelMap, type ReloadType } from 'types/reload';

export default new Command({
  isDevelopment: true,
  builder: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('reload')
    .setDescription('Reloads interactions and event handlers')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type of file to reload')
        .setRequired(false)
        .setChoices(
          { name: 'Commands', value: 'command' },
          { name: 'Buttons', value: 'button' },
          { name: 'Modals', value: 'modal' },
          { name: 'Select Menus', value: 'select' },
          { name: 'Events', value: 'event' },
          { name: 'Interactions', value: 'interaction' },
          { name: 'All', value: 'all' },
        ),
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const type = interaction.options.getString('type') ?? 'all';
    const client = interaction.client as ExtendedClient;

    if (!(type in typeLabelMap)) {
      return await interaction.editReply({
        content: `❌ Invalid type: \`${type}\``,
      });
    }

    const toReload = new Set<ReloadType>();

    if (type === 'all' || type === 'interaction') {
      toReload.add('command').add('button').add('modal').add('select');
    }
    if (type !== 'interaction' && type !== 'all') {
      toReload.add(type as ReloadType);
    }
    if (type === 'all') {
      toReload.add('event');
    }

    try {
      for (const reloadType of toReload) {
        const loader = reloadableTypes[reloadType as keyof typeof reloadableTypes];
        if (loader) await loader(client);
      }

      await interaction.editReply({ content: `✅ Reloaded ${typeLabelMap[type as ReloadType]}.` });
    } catch (err) {
      await interaction.editReply({
        content: `❌ Failed to reload ${typeLabelMap[type as ReloadType]}. Check the logs for more details.`,
      });
      logger.error({ err }, `Failed to reload ${typeLabelMap[type as ReloadType]}`);
    }
  },
});
