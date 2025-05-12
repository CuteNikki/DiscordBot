import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

import { Command } from 'classes/base/command';

export default new Command({
  builder: new SlashCommandBuilder().setName('test').setDescription('Test command'),
  execute(interaction) {
    const file = new AttachmentBuilder('assets/a.png', { name: 'a.png' });

    const container = new ContainerBuilder()
      .setAccentColor(Colors.Blurple)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('This is a test message above an action row'))
      .addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('test').setLabel('Test').setStyle(ButtonStyle.Primary),
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
          new UserSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Select a user')
            .addDefaultUsers(interaction.user.id)
            .setMaxValues(1),
        ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('This is a test message below an action row and above a large separator'),
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setDescription('This is a test image').setURL('attachment://a.png'),
        ),
      )
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('This is a test message below an image'))
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('This is a test message below a small separator'))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent('This is a test message inside a section, next to a button'))
          .setButtonAccessory(new ButtonBuilder().setCustomId('test_2').setLabel('test').setStyle(ButtonStyle.Secondary)),
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent('This is a test message inside a section, next to an image'))
          .setThumbnailAccessory(new ThumbnailBuilder().setDescription('This is a test image').setURL('attachment://a.png')),
      );

    interaction.reply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
      files: [file],
    });
  },
});
