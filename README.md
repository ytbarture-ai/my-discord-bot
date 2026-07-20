# 🤖 Discord Bots — BeluGANG

Two Discord bots for the BeluGANG community, ready to deploy on [Railway](https://railway.app).

---

## 🐳 Beluga Bot — Events & Economy

An events and economy bot for BeluGANG.

### Features
- 💸 **BeluBucks** economy system
- ⭐ **XP & leveling** from chatting (15–25 XP/message, 60s cooldown)
- 🛒 **Shop** with purchasable items
- 🏆 **Leaderboards** (XP and BBs)

### Slash Commands
| Command | Description |
|---------|-------------|
| `/balance [user]` | Check your BeluBucks balance |
| `/work` | Earn 50–200 BBs (1h cooldown) |
| `/rank [user]` | View XP rank with progress bar |
| `/level` | Show your current level |
| `/leaderboard [type]` | Top 10 by XP or BeluBucks |
| `/shop [buy]` | Browse or buy items |
| `/info` | Bot information |
| `/data-delete` | Permanently delete your data |

### Setup
```bash
cd bots/beluga
npm install
cp .env.example .env
# Fill in .env with your tokens
node deploy-commands.js   # Register slash commands
node index.js             # Start the bot
```

---

## 🚁 Zeeplin Bot — Moderation & Automod

A full-featured moderation bot with built-in automod.

### Features
- 🔨 **Moderation**: ban, kick, timeout, warn system
- 🛡️ **Automod**: anti-spam, anti-invite-link, anti-excessive-caps
- 📋 **Mod logs**: all actions logged to a configurable channel
- 🚨 **New account detection**: flags accounts under 7 days old

### Slash Commands
| Command | Description |
|---------|-------------|
| `/ban <user> [reason] [delete_days]` | Ban a member |
| `/kick <user> [reason]` | Kick a member |
| `/timeout <user> <duration> [reason]` | Timeout a member |
| `/warn <user> <reason>` | Warn a member |
| `/warnings <user>` | View a member's warnings |
| `/clearwarnings <user> [id]` | Clear warnings |
| `/purge <amount> [user]` | Bulk delete messages |
| `/userinfo [user]` | View user information |
| `/serverinfo` | View server information |
| `/automod <subcommand>` | Configure automod |

### Automod Config (`/automod`)
- `/automod status` — Show current settings
- `/automod antispam <enabled>` — Toggle anti-spam (5 msgs in 5s → 1 min timeout)
- `/automod antilink <enabled>` — Toggle Discord invite link blocking
- `/automod anticaps <enabled>` — Toggle anti-caps (>70% uppercase)
- `/automod logchannel <channel>` — Set mod log channel
- `/automod spamthreshold <messages>` — Adjust spam threshold

### Setup
```bash
cd bots/zeeplin
npm install
cp .env.example .env
# Fill in .env
node deploy-commands.js
node index.js
```

---

## 🚂 Deploy on Railway

Each bot is a **separate Railway service** pointing to its subdirectory.

### Steps

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select this repository
3. Click **Add Service** → **GitHub Repo** again for the second bot
4. For each service, in **Settings → Source**:
   - **Root Directory**: `bots/beluga` (or `bots/zeeplin`)
5. Add environment variables in **Variables** tab:

**Beluga service:**
```
BELUGA_TOKEN=your_token
BELUGA_CLIENT_ID=your_client_id
GUILD_ID=your_guild_id         # optional, for instant command registration
```

**Zeeplin service:**
```
ZEEPLIN_TOKEN=your_token
ZEEPLIN_CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
MOD_LOG_CHANNEL_ID=your_channel_id
```

6. Each service auto-detects `railway.toml` and runs `node index.js`
7. Add a **Railway Volume** at `/app/bots/beluga/data` (and zeeplin) for database persistence across deploys

### Register Commands on Railway
After deploying, open a Railway shell and run:
```bash
node deploy-commands.js
```

---

## 📂 Project Structure

```
bots/
├── beluga/
│   ├── commands/       # Slash commands
│   ├── events/         # Discord event handlers
│   ├── utils/
│   │   └── database.js # SQLite helpers (better-sqlite3)
│   ├── data/           # Auto-created — SQLite DB stored here
│   ├── index.js
│   ├── deploy-commands.js
│   └── railway.toml
└── zeeplin/
    ├── commands/
    ├── events/
    ├── utils/
    │   ├── database.js
    │   └── automod.js
    ├── data/
    ├── index.js
    ├── deploy-commands.js
    └── railway.toml
```

---

## ❓ Questions / Feedback

DM **@Trizoux_Nora** on Discord.
