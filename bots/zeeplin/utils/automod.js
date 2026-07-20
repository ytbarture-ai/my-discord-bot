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

  // Skip if member has Manage Messages permission (mods bypass automod)
  if (message.member.permissions.has('ManageMessages')) return false;

  const cfg = getAutomodConfig(message.guild.id);

  // 1. Anti-spam
  if (cfg.anti_spam) {
    const acted = await checkSpam(message, cfg);
    if (acted) return true;
  }

  // 2. Anti-link (Discord invites)
  if (cfg.anti_link) {
    const acted = await checkLinks(message, cfg);
    if (acted) return true;
  }

  // 3. Anti-caps
  if (cfg.anti_caps) {
    const acted = await checkCaps(message, cfg);
    if (acted) return true;
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
      await message.member.timeout(60_000, 'Automod: spam detected').catch(() => {});
      const warn = await message.channel.send({
        content: `⚠️ ${message.author}, you have been muted for **1 minute** for spamming.`,
      });
      setTimeout(() => warn.delete().catch(() => {}), 8000);
      await sendModLog(message.guild, cfg, {
        title: '🚫 Automod — Anti-Spam',
        user: message.author,
        reason: `Sent ${threshold}+ messages in ${window / 1000}s`,
        action: 'Timeout (1 min)',
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
    addWarning(message.author.id, message.guild.id, message.client.user.id, 'Automod: posted Discord invite link');
    const warn = await message.channel.send({
      content: `⚠️ ${message.author}, Discord invite links are not allowed here!`,
    });
    setTimeout(() => warn.delete().catch(() => {}), 8000);
    await sendModLog(message.guild, cfg, {
      title: '🔗 Automod — Anti-Link',
      user: message.author,
      reason: 'Posted a Discord invite link',
      action: 'Message deleted + warning added',
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
      content: `⚠️ ${message.author}, please avoid excessive CAPS (${pct}% uppercase).`,
    });
    setTimeout(() => warn.delete().catch(() => {}), 8000);
    await sendModLog(message.guild, cfg, {
      title: '📢 Automod — Anti-Caps',
      user: message.author,
      reason: `Message was ${pct}% uppercase`,
      action: 'Message deleted',
      color: 0xF39C12,
    });
  } catch {}
  return true;
}

async function sendModLog(guild, cfg, { title, user, reason, action, color }) {
  const channelId = cfg.log_channel || process.env.MOD_LOG_CHANNEL_ID;
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .addFields(
      { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
      { name: '⚡ Action', value: action, inline: true },
      { name: '📋 Reason', value: reason, inline: false },
    )
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { runAutomod, sendModLog };
