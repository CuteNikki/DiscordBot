import { GoogleTranslator } from '@translate-tools/core/translators/GoogleTranslator';
import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  Colors,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  InteractionContextType,
  codeBlock,
} from 'discord.js';
import { t } from 'i18next';

import { Command, ModuleType } from 'classes/command';

const commandType = ApplicationCommandType.Message;

export default new Command<typeof commandType>({
  module: ModuleType.Utilities,
  data: new ContextMenuCommandBuilder()
    .setName('Translate')
    .setType(commandType)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
  async execute({ interaction, client }) {
    const { user, targetMessage } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const lng = await client.getUserLanguage(user.id);

    const translator = new GoogleTranslator({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
      },
    });

    if (!targetMessage.content) return interaction.editReply(t('translate.none', { lng }));
    const translated = await translator.translate(targetMessage.content, 'auto', lng);
    if (!translated) return interaction.editReply(t('translate.none', { lng }));

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Aqua)
          .setTitle(t('translate.title', { lng }))
          .addFields(
            { name: t('translate.input', { lng }), value: codeBlock(targetMessage.content.substring(0, 4000)) },
            { name: t('translate.output', { lng }), value: codeBlock(translated.substring(0, 4000)) }
          ),
      ],
    });
  },
});
