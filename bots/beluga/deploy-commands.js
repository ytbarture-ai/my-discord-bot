require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.BELUGA_TOKEN);

(async () => {
  try {
    console.log(`[Beluga] Registering ${commands.length} slash commands...`);

    // Use GUILD_ID for instant registration (guild-specific)
    // Remove to register globally (takes up to 1 hour)
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.BELUGA_CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.BELUGA_CLIENT_ID);

    await rest.put(route, { body: commands });
    console.log('[Beluga] ✅ Slash commands registered successfully!');
  } catch (err) {
    console.error('[Beluga] Failed to register commands:', err);
  }
})();
