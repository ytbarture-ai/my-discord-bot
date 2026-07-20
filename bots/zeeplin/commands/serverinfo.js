const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const VERIFICATION_LEVELS = ['None', 'Low', 'Medium', 'High', 'Very High'];
const BOOST_LEVELS = { 0: 'None', 1: 'Level 1', 2: 'Level 2', 3: 'Level 3' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('View information about this server 🏠'),

  async execute(interaction) {
    const { guild } = interaction;
    await guild.fetch();

    const members = guild.members.cache;
    const bots = members.filter(m => m.user.bot).size;
    const humans = members.size - bots;
    const online = members.filter(m => m.presence?.status !== 'offline').size;

    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Members', value: `${guild.memberCount} total\n${humans} humans • ${bots} bots`, inline: true },
        { name: '💬 Channels', value: `${textChannels} text • ${voiceChannels} voice`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '🔒 Verification', value: VERIFICATION_LEVELS[guild.verificationLevel] || 'Unknown', inline: true },
        { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount} boosts (${BOOST_LEVELS[guild.premiumTier] || 'None'})`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
      )
      .setTimestamp();

    if (guild.description) embed.setDescription(guild.description);
    if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  },
};
