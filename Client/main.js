const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");

class Main extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });

    this.commands = new Collection();
    this.initCommands();
    this.initEvents();
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

  emitError(error) {
    import("chalk").then(({ default: chalk }) => {
      return console.log(chalk.red(error));
    });
  }

  initCommands() {
    const commandPath = path.join(__dirname, "..", "Commands");
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((x) => x.endsWith(".js"));
    const commandList = [];

    for (let file of commandFiles) {
      const command = require(path.join(commandPath, file));
      if ("info" in command && "run" in command) {
        this.commands.set(command.info.name, command);
        commandList.push(command.info.toJSON());
      } else {
        this.emitWarning(
          `[Synth Music - WARNING]: The structure of the command is incomplete (${path.join(
            commandPath,
            file
          )})`
        );
      }
    }

    (async () => {
      const rest = new REST().setToken(process.env.Token);
      const request = await rest.put(
        Routes.applicationCommands(process.env.Client_ID),
        { body: commandList }
      );
      this.emitStatus(
        `[Synth Music - Status]: Successfully registered ${request.length} [/] commands`
      );
    })();
  }

  initEvents() {
    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        this.emitError(
          `[Synth Music - ERROR]: Uh-oh, we couldn't find a command named ${interaction.commandName}`
        );
        return;
      }

      try {
        await command.run(interaction);
      } catch (error) {
        this.emitError(`[Synt Music - ERROR]: ${error}`);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content:
              "An unexpected error arose during the execution of this command",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content:
              "An unexpected error arose during the execution of this command",
            ephemeral: true,
          });
        }
      }
    });
  }

  async wakeUp(token) {
    await this.login(token);
    this.emitStatus(`[Synth Music - Status]: I'm awake [${this.user.tag}]`);
  }
}

module.exports = Main;
