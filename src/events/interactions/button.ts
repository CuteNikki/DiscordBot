import { Collection, Events, PermissionsBitField } from 'discord.js';
import { t } from 'i18next';

import type { Button } from 'classes/button';
import { Event } from 'classes/event';

import { sendError } from 'utils/error';
import { keys } from 'utils/keys';

export default new Event({
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    // Since we only want the button interactions we return early if the interaction is not a button
    if (!interaction.isButton()) return;

    const lng = await client.getUserLanguage(interaction.user.id);

    // Get the button with the interactions custom id and return if it wasn't found
    let button: Button | undefined;
    for (const key of client.buttons.keys()) {
      if (interaction.customId.includes(key)) {
        const tempButton = client.buttons.get(key)!;
        if (!tempButton.options.isCustomIdIncluded && key !== interaction.customId) {
          continue;
        } else {
          button = tempButton;
          break;
        }
      }
    }
    if (!button) return;

    const user = await client.getUserData(interaction.user.id);
    if (user.banned) return;

    // Check author only
    if (button.options.isAuthorOnly) {
      const content = t('interactions.author_only', { lng });
      if (interaction.message.interaction && interaction.user.id !== interaction.message.interaction.user.id)
        return interaction.reply({ content, ephemeral: true });
      if (interaction.message.reference && interaction.user.id !== (await interaction.message.fetchReference()).author.id)
        return interaction.reply({ content, ephemeral: true });
    }

    // Permissions check
    if (button.options.permissions?.length) {
      if (!interaction.member)
        return interaction.reply({
          content: t('interactions.guild_only', { lng }),
          ephemeral: true,
        });
      const permissions = interaction.member.permissions as PermissionsBitField;
      if (!permissions.has(button.options.permissions))
        return interaction.reply({
          content: t('interactions.permissions', {
            lng,
            permissions: button.options.permissions.join(', '),
          }),
          ephemeral: true,
        });
    }

    // Bot permissions check
    if (button.options.botPermissions?.length && interaction.guild?.members.me) {
      const permissions = interaction.guild.members.me.permissions;
      if (!permissions.has(button.options.botPermissions)) {
        return interaction.reply({
          content: t('interactions.bot_permissions', {
            lng,
            permissions: button.options.botPermissions.join(', '),
          }),
          ephemeral: true,
        });
      }
    }

    // Check if button is developer only and return if the user's id doesn't match the developer's id
    const developerIds = keys.DEVELOPER_USER_IDS;
    if (button.options.isDeveloperOnly && !developerIds.includes(interaction.user.id))
      return interaction.reply({
        content: t('interactions.developer_only', { lng }),
        ephemeral: true,
      });

    // Check if cooldowns has the current button and add the button if it doesn't have the button
    const cooldowns = client.cooldowns;
    if (!cooldowns.has(button.options.customId)) cooldowns.set(button.options.customId, new Collection());

    const now = Date.now(); // Current time (timestamp)
    const timestamps = cooldowns.get(button.options.customId)!; // Get collection of <user id, last used timestamp>
    // Get the cooldown amount and setting it to 3 seconds if button does not have a cooldown
    const defaultCooldown = 3_000;
    const cooldownAmount = button.options.cooldown ?? defaultCooldown;

    // If the user is still on cooldown and they use the button again, we send them a message letting them know when the cooldown ends
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction.reply({
          content: t('interactions.cooldown', {
            lng,
            action: `\`${button.options.customId}\``,
            timestamp: `<t:${expiredTimestamp}:R>`,
          }),
          ephemeral: true,
        });
      }
    }
    // Set the user id's last used timestamp to now
    timestamps.set(interaction.user.id, now);
    // Remove the user id's last used timestamp after the cooldown is over
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // Try to run the button and send an error message if it couldn't run
    try {
      await button.options.execute({ client, interaction });

      await client.updateClientSettings(keys.DISCORD_BOT_ID, {
        $inc: { ['stats.buttonsExecuted']: 1 },
      });
    } catch (err: any) {
      const message = t('interactions.error', {
        lng,
        error: `\`${err.message}\``,
      });

      if (interaction.deferred) interaction.editReply({ content: message });
      else interaction.reply({ content: message, ephemeral: true });

      await sendError({ client, err, location: `Button Interaction Error: ${button.options.customId}` });
      await client.updateClientSettings(keys.DISCORD_BOT_ID, {
        $inc: { ['stats.buttonsFailed']: 1 },
      });
    }
  },
});
