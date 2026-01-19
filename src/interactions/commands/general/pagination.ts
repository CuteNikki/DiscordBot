import {
  ApplicationIntegrationType,
  ChatInputCommandBuilder,
  EmbedBuilder,
  InteractionContextType,
  SecondaryButtonBuilder,
  userMention,
} from 'discord.js';

import { Command } from 'classes/base/command';
import { Pagination } from 'classes/pagination';

import {
  customPagePreset,
  firstPagePreset,
  lastPagePreset,
  nextPagePreset,
  previousPagePreset,
  refreshButtonPreset,
} from 'utility/pagination';

export default new Command({
  builder: new ChatInputCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
    .setName('pagination')
    .setDescription('A demonstration of pagination'),
  async execute(interaction) {
    await interaction.deferReply();

    const mockData = [
      { userId: '303142922780672001', xp: 9500 },
      { userId: '303142922780672002', xp: 9400 },
      { userId: '303142922780672003', xp: 9400 },
      { userId: '303142922780672004', xp: 9200 },
      { userId: '303142922780672005', xp: 9100 },
      { userId: '303142922780672006', xp: 9000 },
      { userId: '303142922780672007', xp: 8800 },
      { userId: '303142922780672008', xp: 8700 },
      { userId: '303142922780672009', xp: 8600 },
      { userId: '303142922780672010', xp: 8500 },
      { userId: '303142922780672011', xp: 8400 },
      { userId: '303142922780672012', xp: 8300 },
      { userId: '303142922780672013', xp: 8200 },
      { userId: '303142922780672014', xp: 8100 },
      { userId: '303142922780672015', xp: 8000 },
    ].sort((a, b) => b.xp - a.xp); // Sort the mock data by xp in descending order
    // Mock data for pagination

    // DB example (xp leaderboard):
    // const mockData = await prisma.xp.findMany({
    //   where: { guildId: interaction.guildId },
    //   orderBy: { xp: 'desc' },
    //   select: { userId: true, xp: true },
    // });

    const ITEMS_PER_PAGE = 3;

    new Pagination({
      interaction: interaction,
      getTotalPages: () => Math.ceil(mockData.length / ITEMS_PER_PAGE),
      getPageContent: (pageIndex, _totalPages, locate) => {
        const start = pageIndex * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const items = mockData.slice(start, end);
        return [
          new EmbedBuilder().setDescription(
            items
              .map((item) =>
                locate === item.userId
                  ? `**XP: ${item.xp} | User: ${userMention(item.userId)}** 📍`
                  : `XP: ${item.xp} | User: ${userMention(item.userId)}`,
              )
              .join('\n'),
          ),
        ];
      },
      buttons: [
        // First page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_first').setEmoji({ name: '⏪' }),
          ...firstPagePreset,
        }),
        // Previous page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_previous').setEmoji({ name: '⬅️' }),
          ...previousPagePreset,
        }),
        // Custom page button
        (index, totalPages) => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_custom').setLabel(`${index + 1} / ${totalPages}`),
          ...customPagePreset,
        }),
        // Next page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_next').setEmoji({ name: '➡️' }),
          ...nextPagePreset,
        }),
        // Last page button
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_last').setEmoji({ name: '⏩' }),
          ...lastPagePreset,
        }),
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_locate').setEmoji({ name: '📍' }),
          disableOn: () => false,
          onClick: () => {
            // Get the page index of where the user is located
            const userId = interaction.user.id;

            const userEntry = mockData.find((entry) => entry.userId === userId);
            // DB example (xp leaderboard):
            // const userEntry = prisma.xp.findUnique({ where: { userId }, select: { xp: true } });

            if (!userEntry) return { newIndex: -1 };

            const countAbove = mockData.filter((entry) => entry.xp > userEntry.xp).length;
            // DB example (xp leaderboard):
            // const countAbove = await prisma.xp.count({ where: { xp: { gt: userEntry.xp } } });
            // For this to work, the xp must be sorted in descending order

            const pageIndex = Math.floor(countAbove / ITEMS_PER_PAGE);
            return { newIndex: pageIndex, locate: userId };
          },
        }),
        () => ({
          data: new SecondaryButtonBuilder().setCustomId('pagination_refresh').setEmoji({ name: '🔄' }),
          ...refreshButtonPreset,
        }),
      ],
    });
  },
});
