import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

import { Button } from 'classes/button';

import { findGiveawayById, removeParticipant } from 'db/giveaway';
import { logger } from 'utils/logger';

export default new Button({
  customId: 'button-giveaway-leave',
  isCustomIdIncluded: true,
  async execute({ interaction, client }) {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });

    const giveaway = await findGiveawayById(interaction.customId.split('_')[1]);

    if (!giveaway) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription('That giveaway could not be found. It might have ended already!')]
      });
      return;
    }

    if (giveaway.endsAt < Date.now()) {
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription('That giveaway has ended!')] });
      return;
    }

    if (!giveaway.participants.includes(interaction.user.id)) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription('You have not joined that giveaway!')],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('button-giveaway-join').setLabel('Join').setEmoji('🎉').setStyle(ButtonStyle.Primary)
          )
        ]
      });
      return;
    }

    await removeParticipant(giveaway._id, interaction.user.id);
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(client.colors.error).setDescription('You have left the giveaway!')] });

    const msg = await interaction.channel?.messages.fetch(giveaway.messageId);

    if (msg)
      await msg
        .edit({
          embeds: [
            EmbedBuilder.from(msg.embeds[0]).setFields(
              ...msg.embeds[0].fields.slice(0, 3).map((field) => ({ name: field.name, value: field.value, inline: field.inline ? true : false })),
              {
                name: 'Participants',
                value: (giveaway.participants.length - 1).toString()
              }
            )
          ]
        })
        .catch((err) => logger.debug({ err }, 'Could not edit giveaway message'));
  }
});
