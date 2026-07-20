const { EmbedBuilder } = require('discord.js');
const { getAutomodConfig, addWarning } = require('./database');

// In-memory spam tracker: Map<guildId_userId, number[]> (timestamps)
const spamTracker = new Map();

/**
 * Run all automod checks on a message.
 * Returns true if the message was acted on.
 */
async function runAutomod(message) {
  if (!message.guild || message.author.bot) return false;
  if (!message.member) return false;

  // Moderators bypass automod
  if (message.member.permissions.has('ManageMessages')) return false;

  const cfg = getAutomodConfig(message.guild.id);

  if (cfg.anti_spam) {
    if (await checkSpam(message, cfg)) return true;
  }
  if (cfg.anti_link) {
    if (await checkLinks(message, cfg)) return true;
  }
  if (cfg.anti_caps) {
    if (await checkCaps(message, cfg)) return true;
  }

  return false;
}

async function checkSpam(message, cfg) {
  const key = `${message.guild.id}_${message.author.id}`;
  const now = Date.now();
  const window = cfg.spam_window_ms || 5000;
  const threshold = cfg.spam_threshold || 5;

  const times = (spamTracker.get(key) || []).filter(t => now - t < window);
  times.push(now);
  spamTracker.set(key, times);

  if (times.length >= threshold) {
    spamTracker.delete(key);
    try {
      await message.delete().catch(() => {});
      await message.member.timeout(60_000, 'Automod: spam').catch(() => {});
      const warn = await message.channel.send({
        content: `⚠️ ${message.author}, mute **1 minute** pour spam.`,
      });
      setTimeout(() => warn.delete().catch(() => {}), 8000);
      await sendModLog(message.guild, cfg, {
        title: '🚫 Automod — Anti-Spam',
        user: message.author,
        reason: `${threshold}+ messages en ${window / 1000}s`,
        action: 'Timeout 1 min',
        color: 0xE74C3C,
      });
    } catch {}
    return true;
  }
  return false;
}

async function checkLinks(message, cfg) {
  const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/i;
  if (!inviteRegex.test(message.content)) return false;

  try {
    await message.delete().catch(() => {});
    addWarning(message.author.id, message.guild.id, message.client.user.id, 'Automod: lien Discord');
    const warn = await message.channel.send({
      content: `⚠️ ${message.author}, les liens d'invitation Discord ne sont pas autorisés!`,
    });
    setTimeout(() => warn.delete().catch(() => {}), 8000);
    await sendModLog(message.guild, cfg, {
      title: '🔗 Automod — Anti-Link',
      user: message.author,
      reason: 'Lien d\'invitation Discord posté',
      action: 'Message supprimé + avertissement',
      color: 0xE67E22,
    });
  } catch {}
  return true;
}

async function checkCaps(message, cfg) {
  const text = message.content.replace(/[^a-zA-Z]/g, '');
  if (text.length < 10) return false;

  const upper = text.replace(/[^A-Z]/g, '').length;
  const pct = Math.round((upper / text.length) * 100);
  if (pct < (cfg.caps_pct || 70)) return false;

  try {
    await message.delete().catch(() => {});
    const warn = await message.channel.send({
      content: `⚠️ ${message.author}, évite les MAJUSCULES excessives (${pct}%).`,
    });
    setTimeout(() => warn.delete().catch(() => {}), 8000);
    await sendModLog(message.guild, cfg, {
      title: '📢 Automod — Anti-Caps',
      user: message.author,
      reason: `${pct}% majuscules`,
      action: 'Message supprimé',
      color: 0xF39C12,
    });
  } catch {}
  return true;
}

/**
 * Find the mod log channel: uses DB config first,
 * then auto-detects a channel named "mod-logs" or "zeeplin-logs".
 */
async function findLogChannel(guild, cfg) {
  if (cfg.log_channel) {
    const ch = guild.channels.cache.get(cfg.log_channel);
    if (ch) return ch;
  }
  // Auto-detect by name
  return guild.channels.cache.find(c =>
    c.isTextBased() && ['mod-logs', 'zeeplin-logs', 'logs', 'modlogs'].includes(c.name.toLowerCase())
  ) || null;
}

async function sendModLog(guild, cfg, { title, user, reason, action, color }) {
  const channel = await findLogChannel(guild, cfg);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .addFields(
      { name: '👤 Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
      { name: '⚡ Action', value: action, inline: true },
      { name: '📋 Raison', value: reason, inline: false },
    )
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { runAutomod, sendModLog, findLogChannel };
