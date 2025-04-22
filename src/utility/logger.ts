import pino from 'pino';

/**
 * Logger utility using Pino for structured logging.
 * This logger is configured to log to both console and file.
 * The log level can be set to 'debug' or 'info' based on the command line argument.
 * @module logger
 */
export default pino(
  {
    level: process.argv.includes('--debug') ? 'debug' : 'info',
  },
  pino.transport({
    targets: [
      {
        target: 'pino-pretty',
        level: process.argv.includes('--debug') ? 'debug' : 'info',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:yyyy/mm/dd HH:MM:ss',
        },
      },
      {
        target: 'pino/file',
        options: { destination: `${process.cwd()}/logs/pino.log` },
      },
    ],
  }),
);

/**
 * Calculates the width of a string, accounting for emojis and special characters.
 * @param str The string to calculate the width of.
 * @returns The width of the string in characters.
 */
function getStringWidth(str: string): number {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}]/gu;
  return [...str].reduce((width, char) => {
    return width + (emojiRegex.test(char) ? 2 : 1);
  }, 0);
}

/**
 * Formats an array of objects into a table-like string.
 * @param data The array of objects to format.
 * @returns A string representing the formatted table.
 * @example
 * const data = [
 *   { name: 'Alice', age: 30, city: 'New York' },
 *   { name: 'Bob', age: 25, city: 'Los Angeles' },
 *   { name: 'Charlie', age: 35, city: 'Chicago' },
 * ];
 * console.log(table(data));
 * // Output:
 * // ┌─────────┬─────┬─────────────┐
 * // │ name    │ age │ city        │
 * // ├─────────┼─────┼─────────────┤
 * // │ Alice   │ 30  │ New York    │
 * // │ Bob     │ 25  │ Los Angeles │
 * // │ Charlie │ 35  │ Chicago     │
 * // └─────────┴─────┴─────────────┘
 * //
 */
export function table<T extends Record<string, unknown>>(data: T[]): string {
  if (!Array.isArray(data) || data.length === 0) return '[]';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => `${row[h]}`));

  // Calculate column widths using custom string width function
  const colWidths = headers.map((h, i) => Math.max(getStringWidth(h), ...rows.map((r) => getStringWidth(r[i]))));

  const padCell = (cell: string, width: number) => {
    const pad = width - getStringWidth(cell);
    return cell + ' '.repeat(pad);
  };

  const formatRow = (row: string[]) => '│ ' + row.map((cell, i) => padCell(cell, colWidths[i])).join(' │ ') + ' │';

  // Top separator
  const topSeparator = '┌─' + colWidths.map((w) => '─'.repeat(w)).join('─┬─') + '─┐';

  // Row separator (for the rows, between header and content)
  const rowSeparator = '├─' + colWidths.map((w) => '─'.repeat(w)).join('─┼─') + '─┤';

  // Bottom border
  const bottomBorder = '└─' + colWidths.map((w) => '─'.repeat(w)).join('─┴─') + '─┘';

  const contentLines = [formatRow(headers), rowSeparator, ...rows.map(formatRow)];

  return [topSeparator, ...contentLines, bottomBorder].join('\n');
}
