const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "forcestop",
  aliases: ["fstop", "stopall", "killplayers"],
  cooldown: "",
  category: "owner",
  usage: "[guild_id]",
  description: "Force-stop all active players globally, or a specific guild's player. Owner only.",
  args: false, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const players = client.kazagumo?.players;
    if (!players?.size) {
      return message.reply(send(error(`${e.music} No active players to stop.`)));
    }

    if (args[0]) {
      const guildId = args[0].trim();
      const player  = players.get(guildId);
      if (!player) {
        return message.reply(send(error(`${e.warn} No active player found for guild ID \`${guildId}\`.`)));
      }
      const guild = client.guilds.cache.get(guildId);
      await player.destroy();

      const c = new ContainerBuilder().setAccentColor(0xED4245);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.stop} Player Force Stopped`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.dot} **Guild:** ${guild?.name || "Unknown"} (\`${guildId}\`)\n` +
        `${e.dot} **Stopped by:** ${message.author.tag}`
      ));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const count  = players.size;
    const guilds = [...players.keys()];

    const c = new ContainerBuilder().setAccentColor(0x5865F2);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.loading} Force-stopping \`${count}\` active player${count !== 1 ? "s" : ""}...`
    ));
    const loadingMsg = await message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });

    let stopped = 0, failed = 0;
    for (const guildId of guilds) {
      try {
        const p = players.get(guildId);
        if (p) { await p.destroy(); stopped++; }
      } catch {
        failed++;
      }
    }

    const done = new ContainerBuilder().setAccentColor(0xED4245);
    done.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.stop} All Players Stopped`));
    done.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    done.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} **Stopped:** \`${stopped}\` player${stopped !== 1 ? "s" : ""}\n` +
      (failed > 0 ? `${e.warn} **Failed:** \`${failed}\` player${failed !== 1 ? "s" : ""}\n` : "") +
      `${e.dot} **Executed by:** ${message.author.tag}`
    ));
    done.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    done.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# All voice sessions have been terminated  ${e.dot}  Owner Action`
    ));
    return loadingMsg.edit({ components: [done], flags: MessageFlags.IsComponentsV2 });
  },
};
