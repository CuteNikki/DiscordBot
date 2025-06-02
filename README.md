> ###### **Note:** This bot is a work in progress. Some features may be incomplete or require further testing.

# Discord Bot v2

Welcome to the official repository for the v2 of the Discord Bot! This bot is designed to enhance your Discord server by offering a wide variety of features such as moderation tools and much more. The bot is built with flexibility in mind, allowing for easy expansion and customization.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [Configuration](#configuration)
- [Useful Guides](#useful-guides)
  - [Custom Emojis](#custom-emojis)
    - [How to Create](#how-to-create-custom-emojis)
    - [How to Use](#how-to-use-custom-emojis)
  - [Creating Slash Commands](#creating-a-slash-command)
  - [Translation](#translation)
    - [Supported Languages](#supported-languages-and-completion-status)
    - [Message Translation](#message-translation)
    - [Command Translation](#command-translation)
- [Community](#community)
- [Contributing](#contributing)
  - [Steps](#steps-to-contribute)
- [License](#license)

## Features

- [ ] **Moderation Commands**: Moderate your server with features like banning, muting, and kicking.
- [ ] **Reaction Roles**: Assign roles based on user reactions to messages.
- [ ] **Welcome Messages**: Greet new members with personalized messages.
- [ ] **Fun Commands**: Various fun commands to keep the server engaged.

## Installation

### Prerequisites

- Bun installed ([Checkout Bun](https://bun.sh/)).
- Discord bot token ([Discord Developer Portal guide](https://discord.com/developers/docs/intro)).
- Database ([Supported by Prisma](https://www.prisma.io/docs/orm/overview/databases)).

### Setup

1. Clone the repository:

```sh
git clone -b v2 --single-branch https://github.com/CuteNikki/DiscordBot.git
```

2. Install the dependencies:

```sh
bun install
```

3. Create a `.env` file in the root directory and fill in the values.

```sh
cp .env.example .env
```

4. Upload the emojis from the [assets folder](assets/) to your [application](https://discord.com/developers/applications).

5. Set up database:

```sh
bun prisma-migrate
```

6. Run the bot:

```sh
bun run dev
# or
bun run start
```

## Configuration

All bot configuration is done through the [`.env`](.env.example) file located in the root directory and the [`src/utility/keys.ts`](src/utility/keys.ts) file.
<br/>
You can change various settings such as webhooks, presence, and more. For detailed explanations and instructions, please refer to the comments in the files mentioned above.

## Useful guides:

### Custom Emojis

You can find all the emojis that the bot currently uses in the [assets folder](assets/).

#### How to create custom emojis

Visit this website: https://emoji.gg/tools/icon-maker

Follow these steps to get the exact same icon style as the bot currently uses.

1. Change the shape color to white.
2. Change the icon color to black.
3. Change the icon size to 78px.
4. Change the shape to Hexagon.
5. Click on the Icons tab and choose whatever you want.
6. Click `Download PNG`.
7. Rename the file to anything you like.
8. Upload the icon to your application in the [developer portal](https://discord.com/developers/applications).

You can completely change and adjust the icon style to your liking.

#### How to use custom emojis

All custom emojis are fetched in the `clientReady` event and populate `client.customEmojis`.

So in order to access an emoji with the name `globe` you'd do this:

`client.customEmojis.globe`

This will give you the ApplicationEmoji object, which looks like this:

```json
{
  "animated": false,
  "name": "globe",
  "id": "1358759560256688128",
  "application": "1183792864291995678",
  "author": "303142922780672013",
  "managed": false,
  "requiresColons": true,
  "guildId": null,
  "createdTimestamp": 1744023923697,
  "identifier": "globe:1358759560256688128",
  "imageURL": "https://cdn.discordapp.com/emojis/1358759560256688128.webp"
}
```

If you want to use this emoji in a message, I highly recommend to call `.toString()` on it:
<br />
`client.customEmojis.globe.toString()`
<br />
which will output:
<br />
`<globe:1358759560256688128>`

To use it on a button you will need to do this:

```ts
new ButtonBuilder()
  .setCustomId('some-id')
  .setStyle(ButtonStyle.Secondary)
  .setEmoji({ id: client.customEmojis.globe.id })
  .setDisabled(false);
```

### Creating Slash Commands

To add a new slash command, follow these steps:

1. After creating a command, register it by running:

```bash
bun register
```

2. Restart your Discord client to see updated slash commands once the registration script has finished running.

> **Note**: If `isDevelopment` is set to `true` on the command, it will **only** appear in the development server specified in your `.env` file.

#### Example: A Simple Translated Command with Autocomplete.

The example below creates a `/repeat` command that replies with the user's input. It also uses i18next for localization and supports autocomplete.

```ts
import { SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Command } from 'classes/base/command';

export default new Command({
  // Only available in the dev server
  isDevelopment: true,
  // 3-second cooldown
  cooldown: 3000,
  // Bot permissions required to run the command
  // This is just an example, the bot does not need SendMessages to reply to an interaction!!
  botPermissions: ['SendMessages'],
  // Builder for command name, description and options
  builder: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Replies with whatever you say!')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('The text to repeat')
        /*.setRequired(true)*/
        .setAutocomplete(true),
    ),
  autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused();

    // Check if the focused option is the option we want to autocomplete
    if (focusedOption.name === 'text') {
      // Example choices for autocomplete
      const choices = ['Hello World', 'Test', 'Repeat after me'];
      // Filter the choices based on the user input
      const filtered = choices.filter((choice) => choice.toLowerCase().includes(focusedOption.value.toLowerCase()));

      // Discord's limit for autocomplete choices is 25
      const sliced = filtered.slice(0, 25);

      // Respond with [{ name: "displayed text", value: "value" },...]
      interaction.respond(sliced.map((choice) => ({ name: choice, value: choice })));
    }
  },
  execute(interaction) {
    // Get the text option from the interaction
    const text = interaction.options.getString('text', false);

    // Reply with the text the user provided
    // If the user didn't provide any text, we can just say "nothing"
    interaction.reply({
      content: t('repeat.reply', { lng: interaction.locale, text: text ?? t('repeat.nothing', { lng: interaction.locale }) }),
    });
  },
});
```

### Translation

#### Supported Languages and Completion Status

| Language          | Completion |
| ----------------- | ---------- |
| English (`en-GB`) | 100%       |
| English (`en-US`) | 100%       |
| German (`de`)     | 100%       |

#### Message Translation

Translation File: `src/locales/{lng}/messages.json`<br/>
(replace `{lng}` with the language code, e.g. `src/locales/en-GB/messages.json`)

```json
{
  "repeat": {
    "reply": "You said: {{text}}",
    "nothing": "nothing!"
  }
}
```

**Example Outputs:**

| Input  | Output               |
| ------ | -------------------- |
| `test` | `You said: test`     |
| None   | `You said: nothing!` |

#### Command Translation

Translation File: `src/locales/{lng}/commands.json`<br/>
(replace `{lng}` with the language code, e.g. `src/locales/en-GB/commands.json`)

```json
{
  "repeat": {
    "name": "repeat",
    "description": "Replies with whatever you say!",
    "options": [
      {
        "name": "text",
        "description": "The text to repeat"
      }
    ]
  }
}
```

## Community

Join our [Discord community](https://discord.gg/ACR6RBQj4y) for support, feature requests, bug reports, or just hang out with other contributors!

## Contributing

We welcome contributions! If you'd like to help improve the bot, feel free to fork the repository, submit issues, or open pull requests.

### Steps to contribute:

1. Fork the repo
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a pull request

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
