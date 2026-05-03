const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require("discord.js");
const { Playlist } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-delete",
  aliases: ["pldelete", "deletepl", "playlist-delete"],
  cooldown: "5",
  category: "playlist",
  usage: "<name>",
  description: "Permanently delete one of your playlists.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const name = args.join(" ");
    const pl = await Playlist.findOne({ userId: message.author.id, name });
    if (!pl) return message.reply(send(error(`${e.warn} You don't have a playlist named **${name}**.`)));

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.remove} Delete Playlist`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Are you sure you want to **permanently delete** the playlist **${name}**?\n\n` +
      `${e.list} **Tracks:** \`${pl.tracks.length}\`\n\n` +
      `${e.warn} This action **cannot be undone**.`
    ));
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("pldelete_confirm").setLabel("Delete").setEmoji(e.remove).setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("pldelete_cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
      )
    );

    const m = await message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });

    const collector = m.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 30000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      if (interaction.customId === "pldelete_confirm") {
        await Playlist.deleteOne({ userId: message.author.id, name });
        const done = new ContainerBuilder().setAccentColor(0xED4245);
        done.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `${e.yes} Playlist **${name}** has been permanently deleted.`
        ));
        await m.edit({ components: [done], flags: MessageFlags.IsComponentsV2 });
      } else {
        const cancelled = new ContainerBuilder().setAccentColor(0x2B2D31);
        cancelled.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.no} Deletion cancelled.`));
        await m.edit({ components: [cancelled], flags: MessageFlags.IsComponentsV2 });
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") m.edit({ components: [] }).catch(() => {});
    });
  },
};
