const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLevels, getLevelsLeaderboard, xpToLevel, xpForNext } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('See your XP rank 🏅')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Check another user\'s rank').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = getLevels(target.id, interaction.guild.id);

    const lb = getLevelsLeaderboard(interaction.guild.id, 100);
    const rank = lb.findIndex(r => r.user_id === target.id) + 1;

    const currentLevelXP = xpToLevel(data.level);
    const nextLevelXP = xpToLevel(data.level + 1);
    const progressXP = data.xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    const progressPct = Math.floor((progressXP / neededXP) * 100);

    // Progress bar
    const barLength = 20;
    const filled = Math.round((progressPct / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏅 ${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '⭐ Level', value: `**${data.level}**`, inline: true },
        { name: '📊 Rank', value: rank > 0 ? `**#${rank}**` : 'Unranked', inline: true },
        { name: '✨ Total XP', value: `**${data.xp.toLocaleString()}**`, inline: true },
        {
          name: `📈 Progress to Level ${data.level + 1}`,
          value: `\`${bar}\` **${progressPct}%**\n${progressXP.toLocaleString()} / ${neededXP.toLocaleString()} XP`,
        },
      )
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
