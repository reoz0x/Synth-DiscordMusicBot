const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

class Main extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });

    this.commands = new Collection();
    this.initCommands();
    this.wakeUp(process.env.Token);
  }

  emitWarning(warning) {
    import("chalk").then(({ default: chalk }) => {
      return console.log(chalk.yellow(warning));
    });
  }

  emitStatus(status) {
    import("chalk").then(({ default: chalk }) => {
      return console.log(chalk.green(status));
    });
  }

  initCommands() {
    const commandPath = path.join(__dirname, "..", "Commands");
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((x) => x.endsWith(".js"));

    for (let file of commandFiles) {
      const command = require(path.join(commandPath, file));
      if ("info" in command && "run" in command) {
        this.commands.set(command.info.name, command);
      } else {
        this.emitWarning(
          `[Synth Music - WARNING]: The structure of the command is incomplete (${path.join(
            commandPath,
            file
          )})`
        );
      }
    }
  }

  initEvents() {
    this.on(Events.InteractionCreate, (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      console.log(interaction);
    });
  }

  async wakeUp(token) {
    await this.login(token);
    this.emitStatus(`[Synth Music - Status]: I'm awake [${this.user.tag}]`);
  }
}

module.exports = Main;
