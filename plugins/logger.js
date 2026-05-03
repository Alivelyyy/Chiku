const chalk = require("chalk");

const timestamp = () => new Date().toLocaleTimeString("en-US", { hour12: false });

module.exports = {
  info: (...args) =>
    console.log(chalk.gray(`[${timestamp()}]`) + chalk.cyan(" [INFO] ") + chalk.white(...args)),

  success: (...args) =>
    console.log(chalk.gray(`[${timestamp()}]`) + chalk.green(" [OK] ") + chalk.white(...args)),

  warn: (...args) =>
    console.log(chalk.gray(`[${timestamp()}]`) + chalk.yellow(" [WARN] ") + chalk.white(...args)),

  error: (...args) =>
    console.log(chalk.gray(`[${timestamp()}]`) + chalk.red(" [ERROR] ") + chalk.white(...args)),

  debug: (...args) =>
    console.log(chalk.gray(`[${timestamp()}]`) + chalk.magenta(" [DEBUG] ") + chalk.white(...args)),

  music: (...args) =>
    console.log(chalk.gray(`[${timestamp()}]`) + chalk.blue(" [MUSIC] ") + chalk.white(...args)),

  command: (name, guild, user) =>
    console.log(
      chalk.gray(`[${timestamp()}]`) +
      chalk.cyan(" [CMD] ") +
      chalk.white(`${name}`) +
      chalk.gray(" | Guild: ") + chalk.yellow(guild) +
      chalk.gray(" | User: ") + chalk.green(user)
    ),

  ready: (tag) =>
    console.log(
      chalk.gray(`[${timestamp()}]`) +
      chalk.green(" [READY] ") +
      chalk.white(`Logged in as `) +
      chalk.cyan(tag)
    ),
};
