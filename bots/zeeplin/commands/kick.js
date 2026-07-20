const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../utils/automod');
const { getAutomodConfig } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server 👢')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) return interaction.reply({ content: '❌ That user is not in this server.', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: '❌ I cannot kick this user.', ephemeral: true });
    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ You cannot kick someone with an equal or higher role.', ephemeral: true });
    }

    try {
      await target.send({
        embeds: [new EmbedBuilder()
          .setColor(0xE67E22)
          .setTitle(`👢 You have been kicked from ${interaction.guild.name}`)
          .addFields({ name: '📋 Reason', value: reason })
          .setTimestamp()],
      }).catch(() => {});

      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle('👢 Member Kicked')
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
          { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
          { name: '📋 Reason', value: reason, inline: false },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      const cfg = getAutomodConfig(interaction.guild.id);
      await sendModLog(interaction.guild, cfg, {
        title: '👢 Member Kicked',
        user: target,
        reason,
        action: `Kicked by ${interaction.user.tag}`,
        color: 0xE67E22,
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed to kick: ${err.message}`, ephemeral: true });
    }
  },
};
