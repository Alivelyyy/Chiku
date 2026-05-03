const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "invite",
  aliases: ["inv", "addbot", "add"],
  cooldown: "5",
  category: "utility",
  usage: "",
  description: "Get the invite link to add Chiku to your server.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot+applications.commands&permissions=8`;

    const c = new ContainerBuilder().setAccentColor(0x5865F2);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.link} Invite Chiku`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Chiku** is the most feature-rich open-source Discord music bot, built by **ApeX Development**.\n\n` +
        `**What you get:**\n` +
        `${e.music} High-quality Lavalink-powered audio\n` +
        `${e.filter} 10+ audio filters (Bass, Nightcore, 8D, Vaporwave...)\n` +
        `${e.equalizer} 7 EQ presets with interactive controls\n` +
        `${e.queue} Full queue management with pagination\n` +
        `${e.list} Playlist system — create, load & share\n` +
        `${e.lyrics} Genius-powered lyrics lookup\n` +
        `${e.radio} 10-station internet radio browser\n` +
        `${e.search} Smart search with interactive results\n` +
        `${e.diamond} Premium system with Autoplay & 24/7 mode\n` +
        `${e.link} YouTube, Spotify, SoundCloud, Apple Music support`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.sparkle} Open-source  ${e.dot}  Free to use  ${e.dot}  Chiku by ApeX Development`
      )
    );
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Invite Chiku")
          .setStyle(ButtonStyle.Link)
          .setURL(inviteUrl)
          .setEmoji(e.link),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(client.support)
          .setEmoji(e.users),
        new ButtonBuilder()
          .setLabel("Vote on top.gg")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://top.gg/bot/${client.user.id}/vote`)
          .setEmoji(e.trophy)
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
