const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { checkPremium } = require("@database/premiumModel");
const noprefixStore    = require("@database/noprefix");
const { send, error }  = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "noprefix",
  aliases: ["np-grant", "npgrant", "noprefixgrant"],
  cooldown: "",
  category: "owner",
  usage: "<grant / revoke / list> [@user]",
  description: "Grant or revoke no-prefix mode for a premium user. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const sub = args[0]?.toLowerCase();

    if (sub === "list") {
      const all = await noprefixStore.getAll();
      const c = new ContainerBuilder().setAccentColor(0xF1C40F);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.diamond} No-Prefix Users`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      if (!all.length) {
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${e.info} No users currently have no-prefix enabled.`)
        );
      } else {
        const lines = all.map((entry, i) => `\`${i + 1}.\` <@${entry.key}> (\`${entry.key}\`)`);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(lines.join("\n"))
        );
      }
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# ${e.diamond} ${all.length} user${all.length !== 1 ? "s" : ""} with no-prefix access`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const target = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
    if (!target) {
      return message.reply(send(error(`${e.warn} Please mention a user or provide a valid user ID.`)));
    }

    if (sub === "grant") {
      const isPrem = await checkPremium(target.id);
      if (!isPrem) {
        return message.reply(send(error(
          `${e.no} **${target.tag}** does not have Chiku Premium.\n` +
          `Use \`${client.getPrefix(message.guild.id)}givepremium @user\` to grant Premium first.`
        )));
      }

      const already = await noprefixStore.get(target.id);
      if (already) {
        return message.reply(send(error(
          `${e.info} **${target.tag}** already has no-prefix mode enabled.`
        )));
      }

      await noprefixStore.set(target.id, true);

      const c = new ContainerBuilder().setAccentColor(0x57F287);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.yes} No-Prefix Granted`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.yes} **${target.tag}** can now use commands **without a prefix**.\n\n` +
          `${e.dot} **User:** ${target.tag} (\`${target.id}\`)\n` +
          `${e.dot} **Granted by:** ${message.author.tag}\n` +
          `${e.diamond} Requires active Premium at all times.`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Use \`noprefix revoke @user\` to remove this access`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });

    } else if (sub === "revoke") {
      const has = await noprefixStore.get(target.id);
      if (!has) {
        return message.reply(send(error(
          `${e.info} **${target.tag}** does not have no-prefix mode enabled.`
        )));
      }

      await noprefixStore.delete(target.id);

      const c = new ContainerBuilder().setAccentColor(0xED4245);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.no} No-Prefix Revoked`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.yes} No-prefix access has been **revoked** from **${target.tag}**.\n\n` +
          `${e.dot} **User:** ${target.tag} (\`${target.id}\`)\n` +
          `${e.dot} **Revoked by:** ${message.author.tag}\n` +
          `${e.info} They must now use the server prefix to run commands.`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });

    } else {
      const prefix = client.getPrefix(message.guild.id);
      return message.reply(send(error(
        `${e.warn} Invalid subcommand.\n` +
        `**Usage:**\n` +
        `\`${prefix}noprefix grant @user\` — grant no-prefix to a premium user\n` +
        `\`${prefix}noprefix revoke @user\` — revoke no-prefix access\n` +
        `\`${prefix}noprefix list\` — list all no-prefix users`
      )));
    }
  },
};
