import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from 'discord.js';
import i18next from 'i18next';

import { Button } from 'classes/button';

export default new Button({
  customId: 'update_ping',
  authorOnly: false,
  includesCustomId: false,
  permissions: [],
  async execute({ interaction, client }) {
    const lng = client.getLanguage(interaction.user.id);

    const sent = await interaction.update({ content: i18next.t('ping.pinging', { lng }), fetchReply: true });

    await interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blurple)
          .setTitle(i18next.t('ping.title', { lng }))
          .addFields(
            { name: i18next.t('ping.websocket', { lng }), value: `${client.ws.ping}ms` },
            { name: i18next.t('ping.roundtrip', { lng }), value: `${sent.editedTimestamp! - interaction.createdTimestamp}ms` }
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder().setCustomId('update_ping').setLabel(i18next.t('ping.update', { lng })).setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  },
});
