import { LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
// Types
import type { PaginationButtonPreset } from 'types/pagination';
// Utilities
import { logger } from 'utility/logger';

export const firstPagePreset: PaginationButtonPreset = {
  disableOn: (i) => i === 0,
  onClick: () => ({ newIndex: 0 }),
};

export const lastPagePreset: PaginationButtonPreset = {
  disableOn: (i, total) => i === total - 1,
  onClick: (_i, total) => ({ newIndex: total - 1 }),
};

export const nextPagePreset: PaginationButtonPreset = {
  disableOn: (i, total) => i === total - 1,
  onClick: (i, total) => ({ newIndex: i < total - 1 ? i + 1 : i }),
};

export const previousPagePreset: PaginationButtonPreset = {
  disableOn: (i) => i === 0,
  onClick: (i) => ({ newIndex: i > 0 ? i - 1 : i }),
};

export const refreshButtonPreset: PaginationButtonPreset = {
  disableOn: () => false,
  onClick: (i) => ({ newIndex: i }),
};

export const customPagePreset: PaginationButtonPreset = {
  disableOn: (_, totalPages) => totalPages <= 1,
  onClick: async (clickPageIndex, clickTotalPages, buttonInteraction) => {
    // Show the modal
    await buttonInteraction.showModal(
      new ModalBuilder()
        .setCustomId('pagination_modal')
        .setTitle('Custom Page')
        .addLabelComponents(
          new LabelBuilder().setLabel('Enter the page number you want to go to.').setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('pagination_input')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder(`${clickPageIndex + 1}`),
          ),
        ),
    );

    try {
      // Await the modal submission
      const modalInteraction = await buttonInteraction.awaitModalSubmit({
        time: 60_000,
        idle: 60_000,
        filter: (modalInteraction) => modalInteraction.customId === 'pagination_modal',
      });

      // Get the input value from the modal
      const newPage = parseInt(modalInteraction.components.getTextInputValue('pagination_input'));

      // Validate the page number
      if (newPage > 0 && newPage <= clickTotalPages) {
        await modalInteraction.deferUpdate(); // Acknowledge the modal submission

        // Return the valid new page index (adjusted for 0-indexing)
        return { newIndex: newPage - 1 };
      } else {
        // If the page is invalid, show an error message
        await modalInteraction.reply({
          content: `Please enter a valid page number between 1 and ${clickTotalPages}.`,
          flags: [MessageFlags.Ephemeral],
        });
      }
    } catch (error) {
      // Log and handle modal errors (e.g., timeout or invalid input)
      logger.debug({ err: error }, 'Error processing modal submission');

      // Provide feedback to the user if the modal interaction failed
      if (error instanceof Error && error.message.toLowerCase().includes('timed out')) {
        await buttonInteraction.followUp({
          content: 'You took too long to respond. Please try again.',
          flags: [MessageFlags.Ephemeral],
        });
      }
    }

    // Return the current page index if there's an error or invalid input
    return { newIndex: clickPageIndex };
  },
};
