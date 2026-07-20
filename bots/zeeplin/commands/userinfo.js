const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View information about a user 👤')
    .addUserOption(opt => opt.setName('user').setDescription('User to look up').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);

    const roles = member
      ? member.roles.cache
          .filter(r => r.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(r => r.toString())
          .slice(0, 10)
      : [];

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || 0x5865F2)
      .setTitle(`👤 ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '🏷️ Tag', value: target.tag, inline: true },
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: false },
      );

    if (member) {
      embed.addFields(
        { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: '🎭 Nickname', value: member.nickname || 'None', inline: true },
        { name: `🎖️ Roles (${roles.length})`, value: roles.length > 0 ? roles.join(' ') : 'None', inline: false },
      );
    }

    embed.setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
