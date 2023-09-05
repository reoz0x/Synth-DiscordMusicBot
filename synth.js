require('dotenv').config();
const Client = require("./Client/main")
const { GatewayIntentBits } = require("discord.js");
const Synth = new Client({ intents: [GatewayIntentBits.Guilds] })

module.exports = Synth;