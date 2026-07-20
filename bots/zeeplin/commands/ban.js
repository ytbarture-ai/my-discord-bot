const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addWarning } = require('../utils/database');
const { sendModLog } = require('../utils/automod');
const { getAutomodConfig } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server 🔨')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addIntegerOption(opt => opt.setName('delete_days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    const member = interaction.guild.members.cache.get(target.id);

    // Permission checks
    if (member) {
      if (!member.bannable) {
        return interaction.reply({ content: '❌ I cannot ban this user (they may have higher permissions than me).', ephemeral: true });
      }
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: '❌ You cannot ban someone with an equal or higher role.', ephemeral: true });
      }
    }

    try {
      // DM the user before banning
      await target.send({
        embeds: [new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle(`🔨 You have been banned from ${interaction.guild.name}`)
          .addFields({ name: '📋 Reason', value: reason })
          .setTimestamp()],
      }).catch(() => {});

      await interaction.guild.members.ban(target.id, { reason, deleteMessageDays: deleteDays });

      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('🔨 Member Banned')
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
        title: '🔨 Member Banned',
        user: target,
        reason,
        action: `Banned by ${interaction.user.tag}`,
        color: 0xE74C3C,
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed to ban: ${err.message}`, ephemeral: true });
    }
  },
};
