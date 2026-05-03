const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require("discord.js");
const { Premium, checkPremium } = require("@database/premiumModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "deactivate",
  aliases: ["cancelpremium", "removepremium"],
  cooldown: "10",
  category: "premium",
  usage: "",
  description: "Deactivate your Chiku Premium subscription.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const isPrem = await checkPremium(message.author.id);
    if (!isPrem) {
      return message.reply(send(error(`${e.no} You don't have an active Premium subscription.`)));
    }

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.warn} Deactivate Premium`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Are you sure you want to **deactivate** your Premium subscription?\n\n` +
      `${e.warn} You will **immediately lose** all Premium benefits.\n` +
      `${e.warn} Your playlists above the free limit may become inaccessible.\n\n` +
      `This action **cannot be undone**.`
    ));
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("deact_confirm").setLabel("Deactivate").setEmoji(e.no).setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("deact_cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
      )
    );

    const m = await message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    const collector = m.createMessageComponentCollector({ filter: (i) => i.user.id === message.author.id, time: 30000, max: 1 });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      if (interaction.customId === "deact_confirm") {
        await Premium.deleteOne({ userId: message.author.id });
        const done = new ContainerBuilder().setAccentColor(0xED4245);
        done.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `## ${e.no} Premium Deactivated\n\nYour Premium subscription has been deactivated. Thank you for supporting Chiku!\n\n` +
          `${e.arrow} Use \`${client.getPrefix(message.guild.id)}activate <code>\` to reactivate with a new voucher.`
        ));
        await m.edit({ components: [done], flags: MessageFlags.IsComponentsV2 });
      } else {
        const cancelled = new ContainerBuilder().setAccentColor(0x57F287);
        cancelled.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `${e.yes} Deactivation cancelled. Your Premium is still active!`
        ));
        await m.edit({ components: [cancelled], flags: MessageFlags.IsComponentsV2 });
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") m.edit({ components: [] }).catch(() => {});
    });
  },
};
