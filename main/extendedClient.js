require("module-alias/register");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { Kazagumo } = require("kazagumo");
const Spotify = require("kazagumo-spotify");
const { Connectors } = require("shoukaku");
const fs   = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const mongoose = require("mongoose");
const logger = require("@plugins/logger");

const YML = yaml.load(fs.readFileSync("./config.yml", "utf8"));

class ChikuClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel, Partials.Message],
      allowedMentions: { repliedUser: false },
    });

    this.config    = YML;
    this.commands  = new Collection();
    this.aliases   = new Collection();
    this.cooldowns = new Collection();

    this.prefix      = YML.Chiku?.PREFIX || "!";
    this.emojis_set  = "black";
    this.support     = YML.LINKS?.SUPPORT || "https://discord.gg/example";
    this.owners      = YML.BOT?.OWNERS || [];
    this.admins      = YML.BOT?.ADMINS || [];

    this.guildPrefixes  = new Map();
    this._maintenance   = false;
    this._voteSessions  = new Map();
    this._searchCache   = new Map();
  }

  getPrefix(guildId) {
    return this.guildPrefixes.get(guildId) || this.prefix;
  }

  async connect(token, prefix = "!", emojis = "black") {
    this.prefix     = prefix;
    this.emojis_set = emojis;

    await this._connectDB();
    this._initKazagumo();
    this._loadCommands();
    this._loadEvents();
    this._bindGuildEvents();

    await this.login(token);
  }

  async _connectDB() {
    try {
      await mongoose.connect(YML.DATABASE.MONGODB_URI);
      logger.success("Connected to MongoDB");
    } catch (err) {
      logger.error("MongoDB connection failed:", err.message);
      process.exit(1);
    }
  }

  _initKazagumo() {
    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        plugins: [
          new Spotify({
            clientId:          YML.SPOTIFY?.ID,
            clientSecret:      YML.SPOTIFY?.SECRET,
            playlistPageLimit: 5,
            albumPageLimit:    5,
            searchLimit:       10,
            searchMarket:      "US",
          }),
        ],
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(this),
      [
        {
          name:   YML.LAVALINK?.NAME || "main",
          url:    `${YML.LAVALINK?.HOST}:${YML.LAVALINK?.PORT}`,
          auth:   YML.LAVALINK?.AUTH,
          secure: YML.LAVALINK?.SECURE || false,
        },
      ]
    );

    this.kazagumo.shoukaku.on("ready", (name) => {
      logger.success(`Lavalink node "${name}" connected and ready`);
    });

    this.kazagumo.shoukaku.on("disconnect", (name) => {
      logger.warn(`Lavalink node "${name}" disconnected — attempting to reconnect...`);
    });

    this.kazagumo.shoukaku.on("reconnecting", (name) => {
      logger.info(`Lavalink node "${name}" reconnecting...`);
    });

    this.kazagumo.shoukaku.on("error", (name, error) => {
      logger.error(`Lavalink node "${name}" error: ${error?.message || "Unknown"}`);
    });

    this._loadPlayerEvents();
    logger.success("Kazagumo initialized");
  }

  _loadCommands() {
    const commandsPath = path.join(process.cwd(), "commands");
    const categories   = fs.readdirSync(commandsPath);

    let loaded = 0;
    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));
      for (const file of files) {
        try {
          const cmd = require(path.join(categoryPath, file));
          if (!cmd.name) continue;
          this.commands.set(cmd.name, cmd);
          if (cmd.aliases?.length) {
            cmd.aliases.forEach((alias) => this.aliases.set(alias, cmd.name));
          }
          loaded++;
        } catch (err) {
          logger.error(`Failed to load command ${file}:`, err.message);
        }
      }
    }
    logger.success(`Loaded ${loaded} commands across ${categories.length} categories`);
  }

  _loadEvents() {
    const eventDirs = ["client", "custom"];
    let loaded = 0;

    for (const dir of eventDirs) {
      const eventsPath = path.join(process.cwd(), "events", dir);
      if (!fs.existsSync(eventsPath)) continue;

      const files = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));
      for (const file of files) {
        try {
          const event   = require(path.join(eventsPath, file));
          const handler = (...args) => event.execute(this, ...args);
          event.once ? this.once(event.name, handler) : this.on(event.name, handler);
          loaded++;
        } catch (err) {
          logger.error(`Failed to load event ${file}:`, err.message);
        }
      }
    }
    logger.success(`Loaded ${loaded} Discord events`);
  }

  _loadPlayerEvents() {
    const eventsPath = path.join(process.cwd(), "events", "player");
    if (!fs.existsSync(eventsPath)) return;

    let loaded = 0;
    const files = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      try {
        const event = require(path.join(eventsPath, file));
        this.kazagumo.on(event.name, (...args) => event.execute(this, ...args));
        loaded++;
      } catch (err) {
        logger.error(`Failed to load player event ${file}:`, err.message);
      }
    }
    logger.success(`Loaded ${loaded} player events`);
  }

  _bindGuildEvents() {
    this.on("guildCreate", (guild) => {
      logger.success(
        `Joined: "${guild.name}" (${guild.memberCount.toLocaleString()} members) | ID: ${guild.id} | Total: ${this.guilds.cache.size}`
      );
    });

    this.on("guildDelete", (guild) => {
      logger.warn(
        `Left: "${guild.name}" | ID: ${guild.id} | Total: ${this.guilds.cache.size}`
      );
    });

    this.on("voiceStateUpdate", (oldState, newState) => {
      const player = this.kazagumo?.players?.get(oldState.guild?.id);
      if (!player) return;

      const botId = this.user?.id;
      if (!botId) return;

      if (oldState.member?.id === botId && !newState.channelId) {
        const channel = this.channels.cache.get(player.textId);
        player.destroy().catch(() => {});
        if (channel) {
          const {
            ContainerBuilder,
            TextDisplayBuilder,
            SeparatorBuilder,
            SeparatorSpacingSize,
            MessageFlags,
          } = require("discord.js");
          const e = require("@assets/emojis/black.js");
          const c = new ContainerBuilder().setAccentColor(0xED4245);
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${e.stop} Disconnected\n` +
              `-# Chiku was disconnected or kicked from the voice channel. Session ended.`
            )
          );
          channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }
      }
    });
  }
}

module.exports = ChikuClient;
