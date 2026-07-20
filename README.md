# 🤖 Discord Bots — BeluGANG

Deux bots Discord prêts pour [Railway](https://railway.app).

---

## 🐳 Beluga Bot — Événements & Économie

### Fonctionnalités
- 💸 Système **BeluBucks** (monnaie)
- ⭐ **XP & niveaux** par message (cooldown 60s)
- 🛒 **Shop** avec items achetables
- 🏆 **Classements** XP et BeluBucks

### Commandes slash
| Commande | Description |
|----------|-------------|
| `/balance [user]` | Solde BeluBucks |
| `/work` | Gagner 50–200 BBs (cooldown 1h) |
| `/rank [user]` | Rang XP avec barre de progression |
| `/level` | Niveau actuel |
| `/leaderboard [type]` | Top 10 XP ou BeluBucks |
| `/shop [buy]` | Voir ou acheter des items |
| `/info` | Infos du bot |
| `/data-delete` | Supprimer ses données |

---

## 🚁 Zeeplin Bot — Modération & Automod

### Fonctionnalités
- 🔨 **Modération** : ban, kick, timeout, warn
- 🛡️ **Automod** : anti-spam, anti-lien, anti-caps
- 📋 **Logs mod** : auto-détecté (`mod-logs`, `zeeplin-logs` ou `logs`)
- 🚨 **Détection nouveaux comptes** (< 7 jours)

### Commandes slash
| Commande | Description |
|----------|-------------|
| `/ban <user> [reason]` | Bannir |
| `/kick <user> [reason]` | Expulser |
| `/timeout <user> <duration>` | Timeout |
| `/warn <user> <reason>` | Avertir |
| `/warnings <user>` | Voir les warns |
| `/clearwarnings <user> [id]` | Supprimer des warns |
| `/purge <amount> [user]` | Supprimer des messages |
| `/userinfo [user]` | Infos utilisateur |
| `/serverinfo` | Infos serveur |
| `/automod <subcommande>` | Config automod |

### Config Automod (`/automod`)
- `/automod status` — État actuel
- `/automod antispam <on/off>` — Anti-spam (5 msgs/5s → timeout 1 min)
- `/automod antilink <on/off>` — Bloquer les liens d'invitation Discord
- `/automod anticaps <on/off>` — Anti-caps (>70% majuscules)
- `/automod logchannel <channel>` — Choisir le salon de logs
- `/automod spamthreshold <n>` — Seuil anti-spam

---

## 🚂 Déploiement Railway

Chaque bot = **un service Railway séparé** pointant vers son sous-dossier.

### Étapes

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Sélectionner ce dépôt → Railway crée un premier service
3. **Add Service** → **GitHub Repo** → même dépôt → second service
4. Pour **chaque service**, aller dans **Settings → Source** :
   - **Root Directory** : `bots/beluga` ou `bots/zeeplin`
5. **Variables** (onglet Variables) :

**Service Beluga :**
```
BELUGA_TOKEN=ton_token
```

**Service Zeeplin :**
```
ZEEPLIN_TOKEN=ton_token
```

> C'est tout — aucune autre variable requise.

6. Railway détecte automatiquement `railway.toml` et lance `node index.js`
7. Pour la persistance de la base de données, ajouter un **Volume Railway** monté sur `/app/data`

### Enregistrer les commandes slash

Après le premier déploiement, ouvrir un shell Railway et lancer :
```bash
node deploy-commands.js
```
Les commandes apparaissent globalement sur Discord en ~1h.

---

## 📂 Structure

```
bots/
├── beluga/
│   ├── commands/          # Commandes slash
│   ├── events/            # Événements Discord
│   ├── utils/database.js  # SQLite (node:sqlite intégré Node.js)
│   ├── index.js
│   ├── deploy-commands.js
│   └── railway.toml
└── zeeplin/
    ├── commands/
    ├── events/
    ├── utils/
    │   ├── database.js
    │   └── automod.js
    ├── index.js
    ├── deploy-commands.js
    └── railway.toml
```

---

## ❓ Contact

DM **@Trizoux_Nora** sur Discord.
