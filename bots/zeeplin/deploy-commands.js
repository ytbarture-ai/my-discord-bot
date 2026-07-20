require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.ZEEPLIN_TOKEN;
if (!token) { console.error('[Zeeplin] Missing ZEEPLIN_TOKEN'); process.exit(1); }

// Extract client ID directly from the token (no extra env var needed)
const clientId = Buffer.from(token.split('.')[0], 'base64').toString('utf-8');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`[Zeeplin] Registering ${commands.length} global slash commands...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('[Zeeplin] ✅ Global commands registered! (may take up to 1 hour to appear everywhere)');
  } catch (err) {
    console.error('[Zeeplin] Failed to register commands:', err);
  }
})();
