const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	info: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Stuck? This command has your back'),
	async run(interaction) {
		await interaction.reply(`Help meh`);
	},
};