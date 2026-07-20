const { Events, EmbedBuilder } = require('discord.js');
const { getAutomodConfig } = require('../utils/database');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const cfg = getAutomodConfig(member.guild.id);
    const channelId = cfg.log_channel || process.env.MOD_LOG_CHANNEL_ID;
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / 86400000);

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('📥 Member Joined')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '👤 User', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: '📅 Account Age', value: `${accountAge} day${accountAge !== 1 ? 's' : ''}`, inline: true },
        { name: '👥 Member Count', value: `${member.guild.memberCount}`, inline: true },
      )
      .setTimestamp();

    // Flag new accounts (< 7 days)
    if (accountAge < 7) {
      embed.setColor(0xE74C3C);
      embed.setFooter({ text: '⚠️ New account — possible raid/alt' });
    }

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
