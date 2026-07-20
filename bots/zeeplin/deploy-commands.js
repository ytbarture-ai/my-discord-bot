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

const rest = new REST().setToken(process.env.ZEEPLIN_TOKEN);

(async () => {
  try {
    console.log(`[Zeeplin] Registering ${commands.length} slash commands...`);

    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.ZEEPLIN_CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.ZEEPLIN_CLIENT_ID);

    await rest.put(route, { body: commands });
    console.log('[Zeeplin] ✅ Slash commands registered!');
  } catch (err) {
    console.error('[Zeeplin] Failed to register commands:', err);
  }
})();
