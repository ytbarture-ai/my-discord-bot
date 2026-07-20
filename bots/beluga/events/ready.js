const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[Beluga] ✅ Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'BeluGANG', type: ActivityType.Playing }],
      status: 'online',
    });
  },
};
