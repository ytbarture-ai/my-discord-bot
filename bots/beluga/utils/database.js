const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'beluga.db'));

db.exec(`PRAGMA journal_mode = WAL`);

db.exec(`
  CREATE TABLE IF NOT EXISTS economy (
    user_id       TEXT NOT NULL,
    guild_id      TEXT NOT NULL,
    balance       INTEGER DEFAULT 0,
    work_cooldown INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, guild_id)
  );

  CREATE TABLE IF NOT EXISTS levels (
    user_id       TEXT NOT NULL,
    guild_id      TEXT NOT NULL,
    xp            INTEGER DEFAULT 0,
    level         INTEGER DEFAULT 0,
    xp_cooldown   INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, guild_id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT NOT NULL,
    guild_id      TEXT NOT NULL,
    item_id       TEXT NOT NULL,
    purchased_at  INTEGER DEFAULT 0
  );
`);

// ─── Economy ──────────────────────────────────────────────────────────────────

function getEconomy(userId, guildId) {
  let row = db.prepare('SELECT * FROM economy WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  if (!row) {
    db.prepare('INSERT INTO economy (user_id, guild_id) VALUES (?, ?)').run(userId, guildId);
    row = { user_id: userId, guild_id: guildId, balance: 0, work_cooldown: 0 };
  }
  return row;
}

function addBalance(userId, guildId, amount) {
  getEconomy(userId, guildId); // ensure row exists
  db.prepare(`UPDATE economy SET balance = balance + ? WHERE user_id = ? AND guild_id = ?`).run(amount, userId, guildId);
}

function setWorkCooldown(userId, guildId, timestamp) {
  db.prepare('UPDATE economy SET work_cooldown = ? WHERE user_id = ? AND guild_id = ?').run(timestamp, userId, guildId);
}

function getEconomyLeaderboard(guildId, limit = 10) {
  return db.prepare(`SELECT user_id, balance FROM economy WHERE guild_id = ? ORDER BY balance DESC LIMIT ?`).all(guildId, limit);
}

// ─── Levels ───────────────────────────────────────────────────────────────────

function getLevels(userId, guildId) {
  let row = db.prepare('SELECT * FROM levels WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  if (!row) {
    db.prepare('INSERT INTO levels (user_id, guild_id) VALUES (?, ?)').run(userId, guildId);
    row = { user_id: userId, guild_id: guildId, xp: 0, level: 0, xp_cooldown: 0 };
  }
  return row;
}

function addXP(userId, guildId, amount) {
  const data = getLevels(userId, guildId);
  const newXP = data.xp + amount;
  const newLevel = calcLevel(newXP);
  const leveledUp = newLevel > data.level;
  db.prepare(`UPDATE levels SET xp = ?, level = ? WHERE user_id = ? AND guild_id = ?`).run(newXP, newLevel, userId, guildId);
  return { leveledUp, newLevel, newXP };
}

function setXPCooldown(userId, guildId, timestamp) {
  db.prepare('UPDATE levels SET xp_cooldown = ? WHERE user_id = ? AND guild_id = ?').run(timestamp, userId, guildId);
}

function getLevelsLeaderboard(guildId, limit = 10) {
  return db.prepare(`SELECT user_id, xp, level FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT ?`).all(guildId, limit);
}

// ─── Level math ───────────────────────────────────────────────────────────────

function xpToLevel(level) {
  let total = 0;
  for (let i = 0; i < level; i++) total += 5 * i * i + 50 * i + 100;
  return total;
}

function calcLevel(xp) {
  let level = 0;
  while (xp >= xpToLevel(level + 1)) level++;
  return level;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

function getInventory(userId, guildId) {
  return db.prepare('SELECT * FROM inventory WHERE user_id = ? AND guild_id = ?').all(userId, guildId);
}

function addItem(userId, guildId, itemId) {
  db.prepare('INSERT INTO inventory (user_id, guild_id, item_id, purchased_at) VALUES (?, ?, ?, ?)').run(userId, guildId, itemId, Date.now());
}

// ─── Data deletion ────────────────────────────────────────────────────────────

function deleteUserData(userId, guildId) {
  db.prepare('DELETE FROM economy WHERE user_id = ? AND guild_id = ?').run(userId, guildId);
  db.prepare('DELETE FROM levels WHERE user_id = ? AND guild_id = ?').run(userId, guildId);
  db.prepare('DELETE FROM inventory WHERE user_id = ? AND guild_id = ?').run(userId, guildId);
}

module.exports = {
  db,
  getEconomy, addBalance, setWorkCooldown, getEconomyLeaderboard,
  getLevels, addXP, setXPCooldown, getLevelsLeaderboard,
  calcLevel, xpToLevel,
  getInventory, addItem,
  deleteUserData,
};
