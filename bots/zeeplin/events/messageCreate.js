const { Events } = require('discord.js');
const { runAutomod } = require('../utils/automod');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    await runAutomod(message);
  },
};
