const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../utils/automod');
const { getAutomodConfig } = require('../utils/database');

const DURATIONS = {
  '60': 60_000,
  '300': 300_000,
  '600': 600_000,
  '1800': 1_800_000,
  '3600': 3_600_000,
  '21600': 21_600_000,
  '86400': 86_400_000,
  '604800': 604_800_000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member ⏱️')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addStringOption(opt =>
      opt.setName('duration').setDescription('Duration').setRequired(true)
        .addChoices(
          { name: '1 minute', value: '60' },
          { name: '5 minutes', value: '300' },
          { name: '10 minutes', value: '600' },
          { name: '30 minutes', value: '1800' },
          { name: '1 hour', value: '3600' },
          { name: '6 hours', value: '21600' },
          { name: '1 day', value: '86400' },
          { name: '1 week', value: '604800' },
        )
    )
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const durationKey = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const durationMs = DURATIONS[durationKey];
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ I cannot timeout this user.', ephemeral: true });

    try {
      await member.timeout(durationMs, reason);

      const durationLabel = Object.entries({
        '60': '1 minute', '300': '5 minutes', '600': '10 minutes',
        '1800': '30 minutes', '3600': '1 hour', '21600': '6 hours',
        '86400': '1 day', '604800': '1 week',
      }).find(([k]) => k === durationKey)?.[1];

      const embed = new EmbedBuilder()
        .setColor(0xF39C12)
        .setTitle('⏱️ Member Timed Out')
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
          { name: '⏳ Duration', value: durationLabel, inline: true },
          { name: '🛡️ Moderator', value: interaction.user.tag, inline: true },
          { name: '📋 Reason', value: reason, inline: false },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      const cfg = getAutomodConfig(interaction.guild.id);
      await sendModLog(interaction.guild, cfg, {
        title: '⏱️ Member Timed Out',
        user: target,
        reason,
        action: `Timeout (${durationLabel}) by ${interaction.user.tag}`,
        color: 0xF39C12,
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed to timeout: ${err.message}`, ephemeral: true });
    }
  },
};
