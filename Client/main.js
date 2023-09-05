const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  GatewayDispatchEvents,
} = require("discord.js");
const { Riffy } = require("riffy");

class Main extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.commands = new Collection();

    this.lavanodes = [
      {
        host: "localhost",
        password: "youshallnotpass",
        port: 2333,
        secure: false,
      },
    ];

    this.riffy = new Riffy(this, this.lavanodes, {
      send: (payload) => {
        const guild = this.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
      },
      defaultSearchPlatform: "spsearch",
      restVersion: "v4",
    });

    this.wakeUp(process.env.Token);
    this.initCommands();
    this.initEvents();
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
        this.emitError(`[Synth Music - ERROR]: ${error}`);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content:
              "[Synth Music - ERROR]: An unexpected error arose during the execution of this command",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content:
              "[Synth Music - ERROR]: An unexpected error arose during the execution of this command",
            ephemeral: true,
          });
        }
      }
    });

    this.on(Events.ClientReady, async () => {
      this.emitStatus(`[Synth Music - Status]: I'm awake [${this.user.tag}]`);
      await this.riffy.init(this.user.id);
    });

    this.riffy.on("nodeConnect", (node) => {
      this.emitStatus(
        "[Synth Music - Status]: Connection established to the lavalink server"
      );
    });

    this.riffy.on("nodeError", (node, error) => {
      this.emitError(`[Synth Music - ERROR]: Node "${node.name}" encountered an error: ${error.message}`)
    });

    this.on(Events.Raw, (d) => {
      if (
        ![
          GatewayDispatchEvents.VoiceStateUpdate,
          GatewayDispatchEvents.VoiceServerUpdate,
        ].includes(d.t)
      )
        return;
      this.riffy.updateVoiceState(d);
    });
  }

  async wakeUp(token) {
    await this.login(token);
  }
}

module.exports = Main;
