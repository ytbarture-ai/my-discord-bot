const { Events, EmbedBuilder } = require('discord.js');
const { getAutomodConfig } = require('../utils/database');
const { findLogChannel } = require('../utils/automod');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const cfg = getAutomodConfig(member.guild.id);
    const channel = await findLogChannel(member.guild, cfg);
    if (!channel) return;

    const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / 86400000);

    const embed = new EmbedBuilder()
      .setColor(accountAge < 7 ? 0xE74C3C : 0x2ECC71)
      .setTitle('📥 Membre rejoint')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: '👤 Utilisateur', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: '📅 Âge du compte', value: `${accountAge} jour${accountAge !== 1 ? 's' : ''}`, inline: true },
        { name: '👥 Membres', value: `${member.guild.memberCount}`, inline: true },
      )
      .setTimestamp();

    if (accountAge < 7) {
      embed.setFooter({ text: '⚠️ Compte récent — possible raid/alt' });
    }

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
