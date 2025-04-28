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

3. Create a `.env` file in the root directory fill in the values.

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
You can change various settings like webhooks, presence and more.

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

When adding a new command make sure to run `bun register` to register the command!
<br/>
Restart your discord to get refresh the commands after the register script has completed.

Be aware that if `isDevelopment` is set to true then the command will only show up in the development server that was configured in the `.env` file.

The following shows you how to create a simple command that replies with a message (and using translations).

```ts
import { SlashCommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Command } from 'classes/base/command';

export default new Command({
  // Will only be deployed to dev server and only usable by developer
  isDevelopment: true,
  // 3 seconds cooldown
  cooldown: 3000,
  // Permissions the bot needs to execute the command
  // This is just an example, the bot does not need SendMessages to reply to an interaction!!
  botPermissions: ['SendMessages'],
  // Command name, description and options
  // Name must be lowercase and can only contain letters, numbers and underscores
  builder: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Replies with whatever you say!')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('The text to repeat') /*.setRequired(true)*/
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

      interaction.respond(sliced.map((choice) => ({ name: choice, value: choice })));
    }
  },
  execute(interaction) {
    // Get the text option from the interaction
    const text = interaction.options.getString('text');

    // This is just an example, you can do whatever you want with the text

    // Reply with the text the user provided
    // If the user didn't provide any text, we can just say "nothing"
    interaction.reply({
      content: t('repeat.reply', { lng: interaction.locale, text: text ?? t('repeat.nothing', { lng: interaction.locale }) }),
    });
  },
});
```

### Message Translation

```json
{
  "repeat": {
    "reply": "You said: {{text}}",
    "nothing": "nothing!"
  }
}
```

Example outputs with the inputs of `test` and _no input_ would be:

```
You said: test
You said: nothing!
```

### Command translation

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

Join our Discord community for support, updates, and more! [Click Here](https://discord.gg/ACR6RBQj4y).

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
