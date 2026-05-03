const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getSettings } = require("@database/guildSettings");
const logger = require("@plugins/logger");
const e = require("@assets/emojis/black.js");

const DJ_CATEGORIES = new Set(["music", "filters", "playlist"]);

module.exports = {
  name: "messageCreate",
  once: false,
  execute: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    if (!global._blacklist) global._blacklist = new Set();
    if (global._blacklist.has(message.author.id)) return;

    let settings;
    try {
      settings = await getSettings(message.guild.id);
    } catch {
      settings = { prefix: client.prefix, djRole: null, musicChannel: null };
    }

    const prefix = settings.prefix || client.prefix;

    let isNoPrefix = false;

    if (!message.content.startsWith(prefix)) {
      try {
        const { checkPremium } = require("@database/premiumModel");
        const noprefixStore    = require("@database/noprefix");
        const [isPrem, hasNP]  = await Promise.all([
          checkPremium(message.author.id),
          noprefixStore.get(message.author.id),
        ]);
        if (!isPrem || !hasNP) return;
        isNoPrefix = true;
      } catch {
        return;
      }
    }

    const args        = isNoPrefix
      ? message.content.trim().split(/ +/)
      : message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const cmd =
      client.commands.get(commandName) ||
      client.commands.get(client.aliases.get(commandName));

    if (!cmd) return;

    client.guildPrefixes.set(message.guild.id, prefix);

    if (client._maintenance && !client.owners.includes(message.author.id)) {
      const c = new ContainerBuilder().setAccentColor(0xFEE75C);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.maintenance} Under Maintenance`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.warn} **Chiku is currently undergoing maintenance.**\n\n` +
          `Commands are temporarily unavailable. Please check back soon!\n` +
          `> ${e.info} Follow **ApeX Development** for updates.`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${e.maintenance} Chiku by ApeX Development`)
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

    if (settings.musicChannel && DJ_CATEGORIES.has(cmd.category)) {
      if (message.channel.id !== settings.musicChannel) {
        const reply = await message.reply(
          send(error(`${e.music} Music commands can only be used in <#${settings.musicChannel}>.`))
        ).catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 5000);
        return;
      }
    }

    if (cmd.owner && !client.owners.includes(message.author.id)) {
      return message.reply(send(error(`${e.crown} This command is restricted to **bot owners** only.`)));
    }

    if (cmd.admin && !client.admins?.includes(message.author.id)) {
      return message.reply(send(error(`${e.warn} This command is restricted to **bot admins** only.`)));
    }

    if (cmd.premium) {
      try {
        const { checkPremium } = require("@database/premiumModel");
        const isPrem = await checkPremium(message.author.id);
        if (!isPrem) {
          return message.reply(
            send(error(`${e.diamond} This command requires **Chiku Premium**.\nUse \`${prefix}premium\` to learn more.`))
          );
        }
      } catch {}
    }

    if (DJ_CATEGORIES.has(cmd.category) && settings.djRole) {
      const isAdmin   = message.member.permissions.has("Administrator");
      const isManage  = message.member.permissions.has("ManageChannels");
      const hasDjRole = message.member.roles.cache.has(settings.djRole);
      const isOwner   = client.owners.includes(message.author.id);

      if (!isAdmin && !isManage && !hasDjRole && !isOwner) {
        return message.reply(
          send(error(`${e.headphones} You need the <@&${settings.djRole}> role to use music commands.`))
        );
      }
    }

    if (cmd.botPerms?.length) {
      const missing = cmd.botPerms.filter(
        (perm) => !message.guild.members.me.permissions.has(perm)
      );
      if (missing.length) {
        return message.reply(
          send(error(`${e.warn} I'm missing permissions: \`${missing.join(", ")}\``))
        );
      }
    }

    if (cmd.userPerms?.length) {
      const missing = cmd.userPerms.filter(
        (perm) => !message.member.permissions.has(perm)
      );
      if (missing.length) {
        return message.reply(
          send(error(`${e.no} You're missing permissions: \`${missing.join(", ")}\``))
        );
      }
    }

    if (cmd.inVoiceChannel || cmd.player || cmd.queue) {
      if (!message.member.voice?.channel) {
        return message.reply(
          send(error(`${e.headphones} You need to be in a **voice channel** to use this command.`))
        );
      }
    }

    if (cmd.player) {
      const player = client.kazagumo?.players?.get(message.guild.id);
      if (!player) {
        return message.reply(
          send(error(`${e.music} No active player. Use \`${prefix}play <song>\` to start one.`))
        );
      }
    }

    if (cmd.queue) {
      const player = client.kazagumo?.players?.get(message.guild.id);
      if (!player?.queue?.current) {
        return message.reply(
          send(error(`${e.queue} Nothing is playing. Use \`${prefix}play <song>\` to queue tracks.`))
        );
      }
    }

    if (cmd.sameVoiceChannel) {
      const player = client.kazagumo?.players?.get(message.guild.id);
      if (player && message.member.voice?.channelId !== player.voiceId) {
        return message.reply(
          send(error(`${e.headphones} You must be in the **same voice channel** as me.`))
        );
      }
    }

    const cooldownKey = `${cmd.name}:${message.author.id}`;
    if (cmd.cooldown) {
      const cooldownMs = parseFloat(cmd.cooldown) * 1000;
      const existing   = client.cooldowns.get(cooldownKey);
      if (existing) {
        const remaining = (existing - Date.now()) / 1000;
        if (remaining > 0) {
          return message.reply(
            send(error(
              `${e.time} Cooldown active — wait **${remaining.toFixed(1)}s** before using \`${prefix}${cmd.name}\` again.`
            ))
          );
        }
      }
      client.cooldowns.set(cooldownKey, Date.now() + cooldownMs);
      setTimeout(() => client.cooldowns.delete(cooldownKey), cooldownMs);
    }

    if (cmd.args && !args.length) {
      return message.reply(
        send(error(
          `${e.warn} Missing required arguments.\n` +
          `**Usage:** \`${prefix}${cmd.name}${cmd.usage ? " " + cmd.usage : ""}\``
        ))
      );
    }

    try {
      logger.command(cmd.name, message.guild.name, message.author.tag);
      await cmd.execute(client, message, args);
    } catch (err) {
      logger.error(`Command "${cmd.name}" failed:`, err.message);
      await message.reply(
        send(error(`${e.no} An unexpected error occurred. Please try again.`))
      ).catch(() => {});
    }
  },
};
