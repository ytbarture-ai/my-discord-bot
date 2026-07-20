const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages from a channel 🗑️')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('amount').setDescription('Number of messages to delete (1–100)').setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption(opt => opt.setName('user').setDescription('Only delete messages from this user').setRequired(false)),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      // Filter by user if specified
      if (targetUser) messages = messages.filter(m => m.author.id === targetUser.id);

      // Discord only allows deleting messages < 14 days old in bulk
      const twoWeeksAgo = Date.now() - 1_209_600_000;
      messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);
      messages = messages.first(amount);

      if (messages.length === 0) {
        return interaction.editReply('❌ No eligible messages found (messages must be less than 14 days old).');
      }

      const deleted = await interaction.channel.bulkDelete(messages, true);

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🗑️ Messages Purged')
        .setDescription(
          `Deleted **${deleted.size}** message${deleted.size !== 1 ? 's' : ''}` +
          (targetUser ? ` from ${targetUser.tag}` : '') +
          '.'
        )
        .setFooter({ text: `By ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Auto-delete the reply after 5s
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    } catch (err) {
      await interaction.editReply(`❌ Failed to purge: ${err.message}`);
    }
  },
};
