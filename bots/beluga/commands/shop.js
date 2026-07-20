const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getEconomy, addBalance, addItem, getInventory } = require('../utils/database');

const SHOP_ITEMS = [
  { id: 'xp_boost', name: '⚡ XP Boost', description: 'Doubles your XP gain for the next 2 hours', price: 300, emoji: '⚡' },
  { id: 'lucky_token', name: '🍀 Lucky Token', description: 'Your next /work gives maximum earnings', price: 500, emoji: '🍀' },
  { id: 'vip_badge', name: '⭐ VIP Badge', description: 'A cosmetic badge showing your BeluGANG status', price: 1000, emoji: '⭐' },
  { id: 'prestige', name: '💎 Prestige Title', description: 'Display a prestigious rank title in your profile', price: 5000, emoji: '💎' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse and buy items from the BeluGANG shop 🛒')
    .addStringOption(opt =>
      opt.setName('buy')
        .setDescription('Item ID to purchase')
        .setRequired(false)
        .addChoices(...SHOP_ITEMS.map(i => ({ name: `${i.emoji} ${i.name.replace(/[^a-zA-Z ]/g, '').trim()} (${i.price} BBs)`, value: i.id })))
    ),

  async execute(interaction) {
    const buyId = interaction.options.getString('buy');

    if (!buyId) {
      // Show shop
      const econ = getEconomy(interaction.user.id, interaction.guild.id);
      const inv = getInventory(interaction.user.id, interaction.guild.id);
      const ownedIds = new Set(inv.map(i => i.item_id));

      const lines = SHOP_ITEMS.map(item => {
        const owned = ownedIds.has(item.id) ? ' *(owned)*' : '';
        return `${item.emoji} **${item.name}**${owned}\n${item.description}\n💰 **${item.price.toLocaleString()} BBs**`;
      });

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🛒 BeluGANG Shop')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `Your balance: ${econ.balance.toLocaleString()} BBs | Use /shop buy:<item> to purchase` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // Purchase flow
    const item = SHOP_ITEMS.find(i => i.id === buyId);
    if (!item) return interaction.reply({ content: '❌ Item not found.', ephemeral: true });

    const econ = getEconomy(interaction.user.id, interaction.guild.id);
    if (econ.balance < item.price) {
      return interaction.reply({
        content: `❌ You need **${item.price.toLocaleString()} BBs** but only have **${econ.balance.toLocaleString()} BBs**.`,
        ephemeral: true,
      });
    }

    addBalance(interaction.user.id, interaction.guild.id, -item.price);
    addItem(interaction.user.id, interaction.guild.id, item.id);

    const newBal = econ.balance - item.price;
    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Purchase Successful!')
      .setDescription(`You bought **${item.name}**!\n${item.description}`)
      .addFields({ name: '💰 Remaining Balance', value: `${newBal.toLocaleString()} BBs` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
