const fs = require("fs");
const yaml = require("js-yaml");

const YML = yaml.load(fs.readFileSync("./config.yml", "utf8"));

module.exports = {
  bot: {
    owners: YML.BOT.OWNERS,
    admins: YML.BOT.ADMINS,
  },
    
  topgg: {
      key: YML.BOT.TOPGG_KEY
  },

  links: {
    support: YML.LINKS.SUPPORT,
    mongoURI: YML.LINKS.MONGO_URI,
  },
  webhooks: {
    error: YML.WEBHOOKS.ERROR,
    static: YML.WEBHOOKS.STATIC,
    server: YML.WEBHOOKS.SERVER,
    command: YML.WEBHOOKS.COMMAND,
  },
};
