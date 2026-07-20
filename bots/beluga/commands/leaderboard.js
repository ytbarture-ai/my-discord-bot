const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getEconomyLeaderboard, getLevelsLeaderboard } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top players 🏆')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('What to rank by')
        .setRequired(false)
        .addChoices(
          { name: '💸 BeluBucks', value: 'economy' },
          { name: '⭐ XP / Level', value: 'levels' },
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const type = interaction.options.getString('type') || 'levels';
    const guildId = interaction.guild.id;

    let rows, title, valueLabel;
    if (type === 'economy') {
      rows = getEconomyLeaderboard(guildId, 10);
      title = '💸 BeluBucks Leaderboard';
      valueLabel = (r) => `${r.balance.toLocaleString()} BBs`;
    } else {
      rows = getLevelsLeaderboard(guildId, 10);
      title = '⭐ XP Leaderboard';
      valueLabel = (r) => `Level ${r.level} — ${r.xp.toLocaleString()} XP`;
    }

    const medals = ['🥇', '🥈', '🥉'];

    const lines = await Promise.all(
      rows.map(async (row, i) => {
        const user = await interaction.client.users.fetch(row.user_id).catch(() => null);
        const name = user ? user.username : `Unknown (${row.user_id})`;
        const medal = medals[i] || `**${i + 1}.**`;
        return `${medal} **${name}** — ${valueLabel(row)}`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(title)
      .setDescription(lines.length > 0 ? lines.join('\n') : 'No data yet — start chatting and working!')
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
