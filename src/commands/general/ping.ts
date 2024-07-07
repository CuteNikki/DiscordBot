import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from 'discord.js';
import i18next from 'i18next';

import { Command, Contexts, IntegrationTypes, ModuleType } from 'classes/command';

export default new Command({
  module: ModuleType.General,
  data: {
    name: 'ping',
    description: 'Replies with Pong!',
    type: ApplicationCommandType.ChatInput,
    contexts: [Contexts.Guild, Contexts.BotDM, Contexts.PrivateChannel],
    integration_types: [IntegrationTypes.GuildInstall, IntegrationTypes.UserInstall],
    options: [
      {
        name: 'ephemeral',
        description: 'When set to false will show the message to everyone',
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
  async execute({ interaction, client }) {
    const lng = await client.getUserLanguage(interaction.user.id);
    const ephemeral = interaction.options.getBoolean('ephemeral', false) ?? true;

    const sent = await interaction.reply({ content: i18next.t('ping.pinging', { lng }), fetchReply: true, ephemeral });
    const websocketHeartbeat = interaction.guild?.shard.ping ?? client.ws.ping;

    await interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blurple)
          .setTitle(i18next.t('ping.title', { lng }))
          .addFields(
            { name: i18next.t('ping.websocket', { lng }), value: `${websocketHeartbeat}ms` },
            { name: i18next.t('ping.roundtrip', { lng }), value: `${sent.createdTimestamp - interaction.createdTimestamp}ms` }
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder().setCustomId('button_ping_update').setLabel(i18next.t('ping.update', { lng })).setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  },
});
