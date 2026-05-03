const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getSettings } = require("@database/guildSettings");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "join",
  aliases: ["connect", "summon"],
  cooldown: "5",
  category: "music",
  usage: "",
  description: "Make the bot join your current voice channel.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: ["Connect", "Speak"], userPerms: [],
  player: false, queue: false, inVoiceChannel: true, sameVoiceChannel: false,
  execute: async (client, message) => {
    const voiceChannel   = message.member.voice.channel;
    const existingPlayer = client.kazagumo.players.get(message.guild.id);

    if (existingPlayer) {
      if (existingPlayer.voiceId === voiceChannel.id) {
        return message.reply(
          send(error(`${e.headphones} I'm already in your voice channel!`))
        );
      }
      const prefix = client.getPrefix(message.guild.id);
      return message.reply(
        send(error(`${e.headphones} I'm already in a different voice channel. Use \`${prefix}stop\` first.`))
      );
    }

    let settings;
    try {
      settings = await getSettings(message.guild.id);
    } catch {
      settings = { defaultVolume: 100 };
    }
    const volume = Math.min(200, Math.max(1, settings.defaultVolume || 100));

    await client.kazagumo.createPlayer({
      guildId: message.guild.id,
      textId:  message.channel.id,
      voiceId: voiceChannel.id,
      volume,
      deaf:    true,
    });

    const memberCount = voiceChannel.members.filter(m => !m.user.bot).size;
    const prefix      = client.getPrefix(message.guild.id);

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.headphones} Joined Voice Channel`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.yes} Joined **${voiceChannel.name}**!\n\n` +
        `${e.users} **Listeners:** \`${memberCount}\`\n` +
        `${e.volume} **Volume:** \`${volume}%\`\n\n` +
        `${e.play} Use \`${prefix}play <song>\` to start playing music.`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Summoned by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
