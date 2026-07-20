const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getWarnings } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a member 📋')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warns = getWarnings(target.id, interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(warns.length > 0 ? 0xF39C12 : 0x2ECC71)
      .setTitle(`📋 Warnings for ${target.username}`)
      .setThumbnail(target.displayAvatarURL());

    if (warns.length === 0) {
      embed.setDescription('✅ This user has no warnings.');
    } else {
      const lines = warns.slice(0, 10).map((w, i) => {
        const date = new Date(w.created_at * 1000).toLocaleDateString();
        return `**#${w.id}** — ${w.reason}\n*Warned on ${date}*`;
      });
      embed.setDescription(lines.join('\n\n'));
      embed.setFooter({ text: `${warns.length} total warning${warns.length !== 1 ? 's' : ''} • Use /clearwarnings to remove` });
    }

    embed.setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
