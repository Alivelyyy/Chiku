require("module-alias/register");

const fs = require("fs");
const yaml = require("js-yaml");
const ChikuClient = require("./main/extendedClient");
const antiCrash = require("@utils/antiCrash");

const YML = yaml.load(fs.readFileSync("./config.yml", "utf8"));

const client = new ChikuClient();

antiCrash(client);

client.once("clientReady", () => {
  if (YML.DASHBOARD?.ENABLED !== false) {
    const startApi = require("./api");
    startApi(client, YML);
  }
});

client.connect(
  YML.Chiku.TOKEN,
  YML.Chiku.PREFIX || "!",
  YML.Chiku.EMOJIS || "black"
);

module.exports = client;
