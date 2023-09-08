const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  info: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play songs from Youtube / Spotify")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The name of the song to play")
        .setRequired(true)
    ),
  async run(interaction) {
    const song = await interaction.options.getString("song");
  },
};
