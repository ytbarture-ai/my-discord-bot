const { Events, EmbedBuilder } = require('discord.js');
const { getLevels, addXP, setXPCooldown } = require('../utils/database');

const XP_COOLDOWN_MS = 60_000; // 60 seconds
const XP_MIN = 15;
const XP_MAX = 25;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const { id: userId } = message.author;
    const { id: guildId } = message.guild;
    const now = Date.now();

    const data = getLevels(userId, guildId);

    // Check cooldown
    if (now - data.xp_cooldown < XP_COOLDOWN_MS) return;

    // Grant random XP
    const xpGained = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
    const { leveledUp, newLevel } = addXP(userId, guildId, xpGained);
    setXPCooldown(userId, guildId, now);

    // Announce level up
    if (leveledUp) {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎉 Level Up!')
        .setDescription(`${message.author}, you reached **Level ${newLevel}**!`)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();

      message.channel.send({ embeds: [embed] }).catch(() => {});
    }
  },
};
