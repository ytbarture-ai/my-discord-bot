const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[Zeeplin] ✅ Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: '🛡️ Moderating | /ban /kick', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
