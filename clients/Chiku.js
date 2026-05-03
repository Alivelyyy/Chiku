const YML = require("js-yaml").load(
  require("fs").readFileSync("./config.yml", "utf8"),
);
const ChikuClient = require("../main/extendedClient");

const client = new ChikuClient();
require("@utils/antiCrash")(client);
client.connect(
  YML.Chiku.TOKEN,
  YML.Chiku.PREFIX,
  YML.Chiku.EMOJIS,
);
module.exports = client;
