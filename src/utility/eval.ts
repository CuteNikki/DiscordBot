import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type BaseInteraction,
} from 'discord.js';
import { performance } from 'node:perf_hooks';
import util from 'node:util';
import vm from 'node:vm';

export async function evaluateCode(interaction: BaseInteraction, code: string, depth: number) {
  if (!interaction.isCommand() && !interaction.isModalSubmit()) {
    return;
  }

  if (!interaction.deferred) {
    await interaction.deferReply();
  }

  const startTime = performance.now();
  try {
    // Create context with the custom console
    let consoleOutput = '';
    const context = {
      console: {
        log: (...args: unknown[]) => {
          consoleOutput += '[LOG] ' + args.join(' ') + '\n';
        },
        error: (...args: unknown[]) => {
          consoleOutput += '[ERROR] ' + args.join(' ') + '\n';
        },
        warn: (...args: unknown[]) => {
          consoleOutput += '[WARN] ' + args.join(' ') + '\n';
        },
        info: (...args: unknown[]) => {
          consoleOutput += '[INFO] ' + args.join(' ') + '\n';
        },
      },
      require, // Allow require if needed
      setTimeout, // Allow setTimeout
      setInterval, // Allow setInterval
      clearTimeout, // Allow clearTimeout
      clearInterval, // Allow clearInterval
      fetch, // Allow fetch if available (Node.js 18+)
      interaction,
    };

    // Wrapping the code in an IIFE to allow async/await
    const codeToRun = `(async () => { ${code} })()`;

    // Using vm to run the code in a new context
    const script = new vm.Script(codeToRun);
    const result = await script.runInNewContext(context, { timeout: 5000 }); // 5s timeout to prevent infinite loops

    // Prepare the output
    const resultString = result !== undefined ? util.inspect(result, { depth }) : '';
    const truncatedResult = resultString.length > 1900 ? resultString.slice(0, 1900) + '...' : resultString;
    const truncatedLogs = consoleOutput.length > 1900 ? consoleOutput.slice(0, 1900) + '...' : consoleOutput;

    const endTime = performance.now();

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle('✅ Success')
          .setDescription('Code executed successfully!')
          .addFields(
            { name: 'Input 📥', value: `\`\`\`js\n${code}\n\`\`\`` },
            { name: 'Output 📤', value: `\`\`\`${truncatedResult || 'No output'}\`\`\`` },
            { name: 'Console 📝', value: `\`\`\`${truncatedLogs || 'No console output'}\`\`\`` },
            { name: 'Inspect Depth 🔎', value: `\`${depth}\`` },
            { name: 'Execution Time ⏱️', value: `\`${Math.floor(endTime - startTime)}ms\`` },
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('eval').setLabel('Edit').setStyle(ButtonStyle.Primary).setEmoji({ name: '✏️' }),
        ),
      ],
    });
  } catch (error) {
    const errorString =
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? `${error.name}: ${error.message}\n${error.stack ?? ''}`
          : util.inspect(error, { depth: 2 });
    const truncatedError = errorString.length > 1900 ? `${errorString.slice(0, 1900)}...` : errorString;

    const endTime = performance.now();

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle('❌ Error')
          .setDescription('An error occurred while executing the code.')
          .addFields(
            { name: 'Input 📥', value: `\`\`\`js\n${code}\n\`\`\`` },
            { name: 'Output 📤', value: `\`${truncatedError}\`` },
            { name: 'Execution Time ⏱️', value: `\`${Math.floor(endTime - startTime)}ms\`` },
            { name: 'Inspect Depth 🔎', value: `\`${depth}\`` },
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('eval').setLabel('Edit').setStyle(ButtonStyle.Primary).setEmoji({ name: '✏️' }),
        ),
      ],
    });
  }
}

export function getEvalModal(depth: string | number, code?: string) {
  return new ModalBuilder()
    .setCustomId('eval')
    .setTitle('Eval')
    .setComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('code')
          .setLabel('Code')
          .setPlaceholder('console.log("Hello, world!");\nreturn 1+1;')
          .setValue(code || '')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1900),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('depth')
          .setLabel('Inspect Depth')
          .setPlaceholder('0')
          .setValue(depth.toString())
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(2),
      ),
    );
}
