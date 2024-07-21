import { ApplicationIntegrationType, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { Command, ModuleType } from 'classes/command';

import { registerCommands } from 'loaders/commands';

export default new Command({
  module: ModuleType.Developer,
  isDeveloperOnly: true,
  cooldown: 0,
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Registers commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
  async execute({ interaction, client }) {
    await interaction.deferReply();

    await registerCommands(client);

    await interaction.editReply('Commands have been registered!');
  },
});
