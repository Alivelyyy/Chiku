const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const { checkPremium } = require("@database/premiumModel");
const { formatFillBar } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  cooldown: "2",
  category: "music",
  usage: "[0-200]",
  description: "View or set the player volume. Premium allows up to 200%.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player     = getPlayer(client, message.guild.id);
    const currentVol = player.volume ?? 100;
    const prefix     = client.getPrefix(message.guild.id);

    if (!args[0]) {
      const bar      = formatFillBar(currentVol, 200, 24);
      const volEmoji = currentVol === 0 ? e.volumeMute : currentVol < 50 ? e.volumeDown : e.volume;
      const pct      = Math.round((currentVol / 200) * 100);

      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${volEmoji} Volume`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`${bar}\` \`${pct}%\`\n` +
          `**Current Volume:** \`${currentVol}%\`\n\n` +
          `${e.info} Use \`${prefix}volume <0–100>\` to adjust\n` +
          `${e.diamond} Premium users can set up to \`200%\``
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# ${e.volumeDown} 0%  ${e.dot}  ${currentVol}%  ${e.dot}  200% ${e.volume}  ${e.dot}  ${e.diamond} Max via Premium`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 0 || vol > 200) {
      return message.reply(send(error(`${e.warn} Volume must be between \`0\` and \`200\`.`)));
    }

    if (vol > 100) {
      const isPrem = await checkPremium(message.author.id);
      if (!isPrem) {
        return message.reply(send(error(
          `${e.diamond} Volume above \`100%\` requires **Chiku Premium**.\n` +
          `Use \`${prefix}premium\` to learn more.`
        )));
      }
    }

    await player.setVolume(vol);

    const bar      = formatFillBar(vol, 200, 24);
    const volEmoji = vol === 0 ? e.volumeMute : vol < 50 ? e.volumeDown : e.volume;
    const color    = vol === 0 ? 0xED4245 : vol > 150 ? 0xF1C40F : 0x57F287;
    const pct      = Math.round((vol / 200) * 100);
    const arrow    = vol > currentVol ? "↑" : vol < currentVol ? "↓" : "=";

    const c = new ContainerBuilder().setAccentColor(color);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${volEmoji} Volume Updated`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`${bar}\` \`${pct}%\`\n` +
        `**Volume:** \`${currentVol}%\` ${arrow} \`${vol}%\``
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${volEmoji} Changed by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
