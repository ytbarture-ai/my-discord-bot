const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { clearWarnings, removeWarning } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clear warnings for a member 🗑️')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to clear').setRequired(true))
    .addIntegerOption(opt => opt.setName('id').setDescription('Specific warning ID to remove (leave blank to clear all)').setRequired(false).setMinValue(1)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warnId = interaction.options.getInteger('id');

    if (warnId) {
      const result = removeWarning(warnId, interaction.guild.id);
      if (result.changes === 0) {
        return interaction.reply({ content: `❌ Warning #${warnId} not found.`, ephemeral: true });
      }
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🗑️ Warning Removed')
          .setDescription(`Removed warning **#${warnId}** for ${target.tag}.`)
          .setTimestamp()],
      });
    } else {
      clearWarnings(target.id, interaction.guild.id);
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🗑️ Warnings Cleared')
          .setDescription(`All warnings for ${target.tag} have been cleared.`)
          .setTimestamp()],
      });
    }
  },
};
