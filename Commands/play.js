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
    const player = interaction.client.riffy.createConnection({
      guildId: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channel.id,
      deaf: true,
    });

    const resolve = await interaction.client.riffy.resolve({
      query: song,
      requester: interaction.user,
    });

    const { loadType, tracks, playlistInfo } = resolve;
    if (loadType === "playlist") {
      for (const track of resolve.tracks) {
        track.info.requester = interaction.member;
        player.queue.add(track);
      }

      interaction.reply(
        `Added: \`${tracks.length} tracks\` from \`${playlistInfo.name}\``
      );
      if (!player.playing && !player.paused) return player.play();
    }
  },
};
