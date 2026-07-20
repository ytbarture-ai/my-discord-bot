const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAutomodConfig, setAutomodConfig } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure Zeeplin automod settings 🛡️')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('status').setDescription('Show current automod configuration')
    )
    .addSubcommand(sub =>
      sub.setName('antispam').setDescription('Toggle anti-spam protection')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('antilink').setDescription('Toggle anti-Discord-invite protection')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('anticaps').setDescription('Toggle anti-excessive-caps protection')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('logchannel').setDescription('Set the mod log channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send mod logs').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('spamthreshold').setDescription('Set spam message threshold (default: 5 messages in 5s)')
        .addIntegerOption(opt => opt.setName('messages').setDescription('Messages per window to trigger (2-10)').setRequired(true).setMinValue(2).setMaxValue(10))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'status') {
      const cfg = getAutomodConfig(guildId);
      const logCh = cfg.log_channel ? `<#${cfg.log_channel}>` : 'Not set';

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🛡️ Zeeplin Automod Configuration')
        .addFields(
          { name: '🚫 Anti-Spam', value: cfg.anti_spam ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '🔗 Anti-Link', value: cfg.anti_link ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '📢 Anti-Caps', value: cfg.anti_caps ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '⚡ Spam Threshold', value: `${cfg.spam_threshold} msgs / ${cfg.spam_window_ms / 1000}s`, inline: true },
          { name: '📢 Caps Threshold', value: `${cfg.caps_pct}% uppercase`, inline: true },
          { name: '📋 Log Channel', value: logCh, inline: true },
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'antispam') {
      setAutomodConfig(guildId, 'anti_spam', interaction.options.getBoolean('enabled') ? 1 : 0);
    } else if (sub === 'antilink') {
      setAutomodConfig(guildId, 'anti_link', interaction.options.getBoolean('enabled') ? 1 : 0);
    } else if (sub === 'anticaps') {
      setAutomodConfig(guildId, 'anti_caps', interaction.options.getBoolean('enabled') ? 1 : 0);
    } else if (sub === 'logchannel') {
      const channel = interaction.options.getChannel('channel');
      setAutomodConfig(guildId, 'log_channel', channel.id);
    } else if (sub === 'spamthreshold') {
      setAutomodConfig(guildId, 'spam_threshold', interaction.options.getInteger('messages'));
    }

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('✅ Automod Updated')
        .setDescription(`Setting **${sub}** has been updated.`)
        .setTimestamp()],
    });
  },
};
