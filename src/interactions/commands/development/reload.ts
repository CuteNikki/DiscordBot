import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Command } from 'classes/base/command';

import { loadButtons } from 'loaders/button';
import { loadCommands } from 'loaders/command';
import { loadEvents } from 'loaders/event';
import { loadModals } from 'loaders/modal';
import { loadSelectMenus } from 'loaders/select';

export default new Command({
  isDevelopment: true,
  builder: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('reload')
    .setDescription('Reloads all commands, buttons, modals, and select menus')
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

    const validTypes = ['command', 'button', 'modal', 'select', 'event', 'interaction', 'all'];

    if (!validTypes.includes(type)) {
      return await interaction.editReply({
        content: `❌ Invalid type: \`${type}\``,
      });
    }

    if (type === 'command' || type === 'all' || type === 'interaction') {
      await loadCommands(client);
    }
    if (type === 'button' || type === 'all' || type === 'interaction') {
      await loadButtons(client);
    }
    if (type === 'modal' || type === 'all' || type === 'interaction') {
      await loadModals(client);
    }
    if (type === 'select' || type === 'all' || type === 'interaction') {
      await loadSelectMenus(client);
    }
    if (type === 'event' || type === 'all') {
      await loadEvents(client);
    }

    const typeLabelMap = {
      command: 'commands',
      button: 'buttons',
      modal: 'modals',
      select: 'select menus',
      event: 'events',
      interaction: 'interactions',
      all: 'everything',
    };

    await interaction.editReply({ content: `✅ Reloaded ${typeLabelMap[type as keyof typeof typeLabelMap]}.` });
  },
});
