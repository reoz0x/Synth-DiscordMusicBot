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
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      res = await interaction.client.manager.search(song, interaction.member);
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "empty") throw res.exception;
      if (res.loadType === "playlist") {
        throw { message: "Playlists are not supported with this command." };
      }
      if (res.loadType === "error") {
        return message.reply("there was no tracks found with that query.");
      }
      const player = interaction.client.manager.create({
        guild: interaction.guild.id,
        voiceChannel: interaction.member.voice.channel.id,
        textChannel: interaction.channel.id,
        volume: 100,
      });
      player.connect();
    player.queue.add(res.tracks[0]);
    if (!player.playing && !player.paused && !player.queue.size) player.play();

    return interaction.reply(`enqueuing ${res.tracks[0].title}.`);
    } catch (err) {
      return interaction.reply(
        `there was an error while searching: ${err.message}`
      );
    }
  },
};
