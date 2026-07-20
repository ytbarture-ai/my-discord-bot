const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, setWorkCooldown } = require('../utils/database');

const COOLDOWN_MS = 3_600_000; // 1 hour
const EARN_MIN = 50;
const EARN_MAX = 200;

const JOBS = [
  'fishing 🎣', 'coding 💻', 'delivering pizza 🍕', 'mining ⛏️',
  'streaming 🎮', 'farming 🌾', 'driving a taxi 🚕', 'baking 🍞',
  'playing music 🎸', 'designing logos 🎨', 'walking dogs 🐕',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work and earn BeluBucks! (1 hour cooldown) 💼'),

  async execute(interaction) {
    const { id: userId } = interaction.user;
    const { id: guildId } = interaction.guild;
    const now = Date.now();

    const data = getEconomy(userId, guildId);
    const remaining = COOLDOWN_MS - (now - data.work_cooldown);

    if (remaining > 0) {
      const mins = Math.ceil(remaining / 60_000);
      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('⏳ Cooldown')
        .setDescription(`You're tired! Come back in **${mins} minute${mins !== 1 ? 's' : ''}**.`)
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const earned = Math.floor(Math.random() * (EARN_MAX - EARN_MIN + 1)) + EARN_MIN;
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];

    addBalance(userId, guildId, earned);
    setWorkCooldown(userId, guildId, now);

    const newData = getEconomy(userId, guildId);

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('💼 Work Complete!')
      .setDescription(`You spent the hour **${job}** and earned **${earned} BeluBucks**!`)
      .addFields({ name: '💰 Total Balance', value: `${newData.balance.toLocaleString()} BBs` })
      .setFooter({ text: 'Come back in 1 hour to work again' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
