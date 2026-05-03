const logger = require("@plugins/logger");

module.exports = {
  name: "clientReady",
  once: true,
  execute: async (client) => {
    logger.ready(client.user.tag);

    const guilds  = client.guilds.cache.size;
    const users   = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const cmds    = client.commands.size;
    const aliases = client.aliases.size;
    const shard   = client.shard?.ids?.[0] ?? 0;
    const mem     = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    logger.info(`Guilds: ${guilds.toLocaleString()}  |  Users: ${users.toLocaleString()}  |  Commands: ${cmds}  |  Aliases: ${aliases}  |  Shard: ${shard}  |  Memory: ${mem}MB`);
    logger.info(`Prefix: "${client.prefix}"  |  Owners: ${client.owners.length}  |  Support: ${client.support}`);

    const prefix = client.prefix;

    const activities = [
      { name: `${guilds.toLocaleString()} servers`,  type: 3 },
      { name: "High Quality Music 🎵",                type: 2 },
      { name: `${prefix}play to get started`,         type: 0 },
      { name: "Chiku by ApeX Development",            type: 0 },
      { name: `${prefix}help for commands`,           type: 0 },
      { name: `${prefix}radio for live stations`,     type: 0 },
    ];

    let index = 0;
    const rotate = () => {
      const { name, type } = activities[index % activities.length];
      client.user.setPresence({
        activities: [{ name, type }],
        status: "online",
      });
      index++;
    };

    rotate();
    setInterval(rotate, 20000);

    setInterval(() => {
      const players = client.kazagumo?.players?.size ?? 0;
      if (players > 0) {
        client.user.setActivity(`music in ${players} server${players !== 1 ? "s" : ""}`, { type: 2 });
      }
    }, 60000);
  },
};
