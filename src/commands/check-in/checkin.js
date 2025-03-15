const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { decrypt } = require("../../utils/encryption");
const { urlDict, autoCheckIn } = require("../../utils/api-urls")

const handleCheckinCommand = async(interaction, userProfiles) => {
    const userId = interaction.user.id;

    // Kiểm tra nếu userProfiles[userId] không tồn tại hoặc thiếu token/uid
    if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
        await interaction.reply({ content: "⚠️ You need to set up token and UID first!", flags: MessageFlags.Ephemeral });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎮 Choose a game to Check-in!")
        .setDescription("Click the button below to select the game you want to check-in.")
        .setTimestamp();

    const row = new ActionRowBuilder();
    Object.keys(urlDict).forEach((game) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`checkin_${game}_${userId}`)
                .setLabel(game.replace("_", " "))
                .setStyle(ButtonStyle.Primary)
        );
    });

    row.addComponents(
        new ButtonBuilder()
            .setCustomId(`checkin_all_${userId}`)
            .setLabel("All Games")
            .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
}

const handleCheckinButton = async(interaction, userProfiles) => {
    const customId = interaction.customId;
    if (!customId.startsWith("checkin_")) return;

    const lastUnderscoreIndex = customId.lastIndexOf("_");
    if (lastUnderscoreIndex === -1) return;

    const game = customId.substring(8, lastUnderscoreIndex);
    const userIdFromButton = customId.substring(lastUnderscoreIndex + 1);
    const userId = interaction.user.id;

    if (userId !== userIdFromButton) {
        await interaction.reply({ content: "⚠️ You can't press this button!", flags: MessageFlags.Ephemeral });
        return;
    }

    const gameName = game === "all" ? "all games" : game.replace("_", " ");
    await interaction.reply(`🔄 Checking-in for **${gameName}**...`);

    try {
        const responseMessage = await autoCheckIn(userId, game === "all" ? null : game, userProfiles);
        await interaction.editReply(responseMessage);
    } catch (error) {
        console.error(`📌[ERROR] Error when check-in:`, error);
        await interaction.editReply("❌ There was an error when checking in.");
    }
}

module.exports = { handleCheckinCommand, handleCheckinButton };
