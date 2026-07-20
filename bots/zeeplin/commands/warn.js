const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addWarning, getWarnings } = require('../utils/database');
const { sendModLog } = require('../utils/automod');
const { getAutomodConfig } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member ⚠️')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (target.bot) return interaction.reply({ content: '❌ You cannot warn a bot.', ephemeral: true });

    addWarning(target.id, interaction.guild.id, interaction.user.id, reason);
    const warnings = getWarnings(target.id, interaction.guild.id);

    // DM the user
    await target.send({
      embeds: [new EmbedBuilder()
        .setColor(0xF39C12)
        .setTitle(`⚠️ Warning received in ${interaction.guild.name}`)
        .addFields(
          { name: '📋 Reason', value: reason },
          { name: '⚠️ Total Warnings', value: `${warnings.length}` },
        )
        .setTimestamp()],
    }).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('⚠️ Member Warned')
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
        { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
        { name: '⚠️ Total Warnings', value: `${warnings.length}`, inline: true },
        { name: '📋 Reason', value: reason, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const cfg = getAutomodConfig(interaction.guild.id);
    await sendModLog(interaction.guild, cfg, {
      title: '⚠️ Member Warned',
      user: target,
      reason,
      action: `Warning #${warnings.length} by ${interaction.user.tag}`,
      color: 0xF39C12,
    });
  },
};
