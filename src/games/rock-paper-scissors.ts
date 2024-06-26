import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, type ChatInputCommandInteraction, type User } from 'discord.js';
import i18next from 'i18next';

import { Opponent } from 'games/opponent';

import type { DiscordClient } from 'classes/client';

enum CustomIds {
  ROCK = 'RPS_ROCK',
  PAPER = 'RPS_PAPER',
  SCISSORS = 'RPS_SCISSORS',
}
enum Picks {
  ROCK = '🪨',
  PAPER = '🧻',
  SCISSORS = '✂️',
}

export class RockPaperScissors extends Opponent {
  playerPick: Picks | null = null;
  opponentPick: Picks | null = null;
  constructor(
    public options: {
      interaction: ChatInputCommandInteraction;
      opponent: User | null;
      client: DiscordClient;
    }
  ) {
    super(options);

    this.start();
  }

  private async start() {
    const interaction = this.options.interaction;
    const user = interaction.user;
    const opponent = this.options.opponent;
    const client = this.options.client;

    const lng = await client.getLanguage(user.id);
    const opponentLng = await client.getLanguage(opponent?.id);

    const rockButton = new ButtonBuilder()
      .setLabel(i18next.t('games.rpc.choices.rock', { lng }))
      .setEmoji('🪨')
      .setCustomId(CustomIds.ROCK)
      .setStyle(ButtonStyle.Primary);
    const paperButton = new ButtonBuilder()
      .setLabel(i18next.t('games.rpc.choices.paper', { lng }))
      .setEmoji('🧻')
      .setCustomId(CustomIds.PAPER)
      .setStyle(ButtonStyle.Primary);
    const scissorsButton = new ButtonBuilder()
      .setLabel(i18next.t('games.rpc.choices.scissors', { lng }))
      .setEmoji('✂️')
      .setCustomId(CustomIds.SCISSORS)
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(rockButton, paperButton, scissorsButton);

    let message = null;

    if (opponent) {
      message = await this.isApprovedByOpponent();
    } else {
      const picks = Object.values(Picks);
      const randomIndex = Math.floor(Math.random() * picks.length);
      const randomPick = picks[randomIndex];
      this.opponentPick = randomPick as Picks;

      message = await interaction
        .editReply({
          content: i18next.t('games.rpc.bot', { lng }),
        })
        .catch(() => {});
    }

    if (!message) return;

    await interaction
      .editReply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle(i18next.t('games.rpc.title', { lng }))
            .setDescription(i18next.t('games.rpc.description', { lng, player: user.toString() })),
        ],
        components: [row],
      })
      .catch(() => {});

    const collector = message.createMessageComponentCollector({ idle: 60 * 1000 });

    collector.on('collect', async (buttonInteraction) => {
      await buttonInteraction.deferUpdate().catch(() => {});

      if (buttonInteraction.user.id !== user.id && buttonInteraction.user.id !== opponent?.id) {
        return buttonInteraction.followUp({
          content: i18next.t('interactions.author_only', { lng: await client.getLanguage(buttonInteraction.user.id) }),
          ephemeral: true,
        });
      }

      if (buttonInteraction.user.id === user.id) {
        if (this.playerPick)
          return buttonInteraction
            .followUp({
              content: i18next.t('games.rpc.already', { lng }),
              ephemeral: true,
            })
            .catch(() => {});
        this.playerPick = Picks[buttonInteraction.customId.split('_')[1] as keyof typeof Picks];
        await buttonInteraction.followUp({ content: i18next.t('games.rpc.picked', { lng, pick: this.playerPick }), ephemeral: true }).catch(() => {});
      }

      if (buttonInteraction.user.id === opponent?.id) {
        if (this.opponentPick)
          return buttonInteraction
            .followUp({
              content: i18next.t('games.rpc.already', { lng: opponentLng }),
              ephemeral: true,
            })
            .catch(() => {});
        this.opponentPick = Picks[buttonInteraction.customId.split('_')[1] as keyof typeof Picks];
        await buttonInteraction
          .followUp({ content: i18next.t('games.rpc.picked', { lng: opponentLng, pick: this.opponentPick }), ephemeral: true })
          .catch(() => {});
      }

      if (this.opponentPick && this.playerPick) return collector.stop();
    });

    collector.on('end', async () => {
      return await this.getResult(lng);
    });
  }

  private isPlayerWinner() {
    return (
      (this.playerPick === Picks.ROCK && this.opponentPick === Picks.SCISSORS) ||
      (this.playerPick === Picks.PAPER && this.opponentPick === Picks.ROCK) ||
      (this.playerPick === Picks.SCISSORS && this.opponentPick === Picks.PAPER)
    );
  }

  private async getResult(lng: string) {
    const interaction = this.options.interaction;
    const user = interaction.user;
    const opponent = this.options.opponent;
    const client = interaction.client;

    let result: 'TIMEOUT' | 'TIE' | 'PLAYER' | 'OPPONENT' | null = null;

    if (!this.playerPick || !this.opponentPick) result = 'TIMEOUT';
    else if (this.playerPick === this.opponentPick) result = 'TIE';
    else if (this.isPlayerWinner()) result = 'PLAYER';
    else result = 'OPPONENT';

    const embed = new EmbedBuilder()
      .setTitle(i18next.t('games.rpc.title', { lng }))
      .setColor(result === 'TIE' ? Colors.Yellow : result === 'TIMEOUT' ? Colors.Yellow : result === 'OPPONENT' ? Colors.Red : Colors.Green)
      .addFields(
        { name: user.displayName, value: this.playerPick ?? '❔', inline: true },
        { name: 'vs', value: '⚡', inline: true },
        { name: opponent?.displayName ?? client.user.displayName, value: this.opponentPick ?? '❔', inline: true }
      );

    if (result === 'TIMEOUT') embed.setDescription(i18next.t('games.rpc.timeout', { lng }));
    else if (result === 'TIE') embed.setDescription(i18next.t('games.rpc.tie', { lng }));
    else if (result === 'PLAYER') embed.setDescription(i18next.t('games.rpc.winner', { lng, winner: user.toString() }));
    else embed.setDescription(i18next.t('games.rpc.winner', { lng, winner: opponent?.toString() ?? client.user.toString() }));

    return await interaction
      .editReply({
        content: null,
        embeds: [embed],
        components: [],
      })
      .catch(() => {});
  }
}
