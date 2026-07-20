const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Information about Beluga bot ℹ️'),

  async execute(interaction) {
    const uptimeSecs = Math.floor(process.uptime());
    const days = Math.floor(uptimeSecs / 86400);
    const hours = Math.floor((uptimeSecs % 86400) / 3600);
    const mins = Math.floor((uptimeSecs % 3600) / 60);
    const secs = uptimeSecs % 60;
    const uptime = `${days}d ${hours}h ${mins}m ${secs}s`;

    const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('👋 Hi, I\'m Beluga!')
      .setDescription('I\'m an events & economy bot for **BeluGANG**!\n💸 Complete events to earn BeluBucks.\n💬 Talk in chat to earn XP and level up.')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        { name: '🤖 Bot Tag', value: interaction.client.user.tag, inline: true },
        { name: '🏠 Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: '⏱️ Uptime', value: uptime, inline: true },
        { name: '💾 Memory', value: `${memMB} MB`, inline: true },
        { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true },
        { name: '🟢 Node.js', value: process.version, inline: true },
        { name: '📋 Commands', value: '/balance • /work • /rank • /level • /leaderboard • /shop • /info • /data-delete', inline: false },
      )
      .setFooter({ text: 'DM @Trizoux_Nora with questions or feedback!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
