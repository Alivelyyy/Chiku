const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "broadcast",
  aliases: ["announce", "bc"],
  cooldown: "",
  category: "owner",
  usage: "<message>",
  description: "Broadcast a message to all guilds' system/default channels. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const msg = args.join(" ");
    const broadcastC = new ContainerBuilder().setAccentColor(0xF1C40F);
    broadcastC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📢 Announcement from ApeX Development`));
    broadcastC.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    broadcastC.addTextDisplayComponents(new TextDisplayBuilder().setContent(msg));
    broadcastC.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    broadcastC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Chiku by ApeX Development`));

    const confirmC = new ContainerBuilder().setAccentColor(0x5865F2);
    confirmC.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.loading} Broadcasting to \`${client.guilds.cache.size}\` guilds...`
    ));
    const loadingMsg = await message.reply({ components: [confirmC], flags: MessageFlags.IsComponentsV2 });

    let success = 0, fail = 0;
    const guilds = [...client.guilds.cache.values()];

    for (const guild of guilds) {
      try {
        const channel =
          guild.systemChannel ||
          guild.channels.cache.find((c) => c.type === 0 && c.permissionsFor(guild.members.me)?.has("SendMessages"));
        if (channel) {
          await channel.send({ components: [broadcastC], flags: MessageFlags.IsComponentsV2 });
          success++;
        } else {
          fail++;
        }
      } catch {
        fail++;
      }
    }

    const doneC = new ContainerBuilder().setAccentColor(0x57F287);
    doneC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} Broadcast Complete`));
    doneC.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    doneC.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.dot} **Delivered:** \`${success}\` guilds\n` +
      `${e.dot} **Failed:** \`${fail}\` guilds\n` +
      `${e.dot} **Total:** \`${guilds.length}\` guilds`
    ));
    return loadingMsg.edit({ components: [doneC], flags: MessageFlags.IsComponentsV2 });
  },
};
