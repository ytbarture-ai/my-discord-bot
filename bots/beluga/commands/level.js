const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLevels, xpToLevel } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your current level and XP ⭐'),

  async execute(interaction) {
    const data = getLevels(interaction.user.id, interaction.guild.id);

    const currentLevelXP = xpToLevel(data.level);
    const nextLevelXP = xpToLevel(data.level + 1);
    const progressXP = data.xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle(`⭐ Level ${data.level}`)
      .setDescription(`You have **${data.xp.toLocaleString()} total XP**`)
      .addFields(
        { name: '📈 Progress', value: `${progressXP.toLocaleString()} / ${neededXP.toLocaleString()} XP to level ${data.level + 1}`, inline: false },
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: 'Keep chatting to earn XP!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
