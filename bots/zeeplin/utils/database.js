const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'zeeplin.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL,
    guild_id    TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason      TEXT NOT NULL,
    created_at  INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS automod_config (
    guild_id      TEXT PRIMARY KEY,
    anti_spam     INTEGER DEFAULT 1,
    anti_link     INTEGER DEFAULT 1,
    anti_caps     INTEGER DEFAULT 1,
    spam_threshold INTEGER DEFAULT 5,
    spam_window_ms INTEGER DEFAULT 5000,
    caps_pct      INTEGER DEFAULT 70,
    log_channel   TEXT DEFAULT NULL
  );
`);

// ─── Warnings ─────────────────────────────────────────────────────────────────

function addWarning(userId, guildId, moderatorId, reason) {
  return db.prepare(`
    INSERT INTO warnings (user_id, guild_id, moderator_id, reason)
    VALUES (?, ?, ?, ?)
  `).run(userId, guildId, moderatorId, reason);
}

function getWarnings(userId, guildId) {
  return db.prepare(`
    SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?
    ORDER BY created_at DESC
  `).all(userId, guildId);
}

function clearWarnings(userId, guildId) {
  return db.prepare('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?').run(userId, guildId);
}

function removeWarning(id, guildId) {
  return db.prepare('DELETE FROM warnings WHERE id = ? AND guild_id = ?').run(id, guildId);
}

// ─── Automod config ───────────────────────────────────────────────────────────

function getAutomodConfig(guildId) {
  let cfg = db.prepare('SELECT * FROM automod_config WHERE guild_id = ?').get(guildId);
  if (!cfg) {
    db.prepare('INSERT INTO automod_config (guild_id) VALUES (?)').run(guildId);
    cfg = db.prepare('SELECT * FROM automod_config WHERE guild_id = ?').get(guildId);
  }
  return cfg;
}

function setAutomodConfig(guildId, field, value) {
  // Whitelist allowed fields to prevent SQL injection
  const allowed = ['anti_spam', 'anti_link', 'anti_caps', 'spam_threshold', 'spam_window_ms', 'caps_pct', 'log_channel'];
  if (!allowed.includes(field)) throw new Error(`Invalid field: ${field}`);
  db.prepare(`UPDATE automod_config SET ${field} = ? WHERE guild_id = ?`).run(value, guildId);
}

module.exports = {
  db,
  addWarning, getWarnings, clearWarnings, removeWarning,
  getAutomodConfig, setAutomodConfig,
};
