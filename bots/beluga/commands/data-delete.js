const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { deleteUserData } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data-delete')
    .setDescription('Permanently delete all your data from Beluga ⚠️'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('⚠️ Delete Your Data')
      .setDescription(
        'This will **permanently delete** all your data:\n\n' +
        '• 💸 BeluBucks balance\n' +
        '• ⭐ XP and level\n' +
        '• 🎒 Inventory\n\n' +
        '**This action cannot be undone.** Are you sure?'
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_delete')
        .setLabel('Yes, delete my data')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('cancel_delete')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

    const reply = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30_000,
      filter: i => i.user.id === interaction.user.id,
    });

    collector.on('collect', async i => {
      if (i.customId === 'confirm_delete') {
        deleteUserData(interaction.user.id, interaction.guild.id);
        const done = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('✅ Data Deleted')
          .setDescription('All your data has been permanently removed from Beluga.');
        await i.update({ embeds: [done], components: [] });
      } else {
        await i.update({ content: '❌ Cancelled.', embeds: [], components: [] });
      }
      collector.stop();
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        interaction.editReply({ content: '⏰ Timed out.', embeds: [], components: [] }).catch(() => {});
      }
    });
  },
};
