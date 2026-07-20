const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getEconomy, getEconomyLeaderboard } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your BeluBucks balance 💸')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Check another user\'s balance').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = getEconomy(target.id, interaction.guild.id);

    // Get rank
    const lb = getEconomyLeaderboard(interaction.guild.id, 100);
    const rank = lb.findIndex(r => r.user_id === target.id) + 1;

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('💰 BeluBucks Balance')
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '💸 Balance', value: `**${data.balance.toLocaleString()} BBs**`, inline: true },
        { name: '📊 Rank', value: rank > 0 ? `#${rank}` : 'Unranked', inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
