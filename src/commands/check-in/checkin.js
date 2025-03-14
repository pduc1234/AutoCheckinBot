const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { decrypt } = require("../../utils/encryption");
const { urlDict, autoCheckIn } = require("../../utils/api-urls")

const handleCheckinCommand = async(interaction, userProfiles) => {
    const userId = interaction.user.id;

    // Kiểm tra nếu userProfiles[userId] không tồn tại hoặc thiếu token/uid
    if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
        await interaction.reply({ content: "⚠️ Bạn cần thiết lập token và UID trước!", flags: MessageFlags.Ephemeral });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎮 Chọn game để Check-in!")
        .setDescription("Nhấn vào nút bên dưới để chọn game bạn muốn check-in.")
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
            .setLabel("Tất cả Game")
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
        await interaction.reply({ content: "⚠️ Bạn không thể bấm nút này!", flags: MessageFlags.Ephemeral });
        return;
    }

    const gameName = game === "all" ? "tất cả game" : game.replace("_", " ");
    await interaction.reply(`🔄 Đang thực hiện check-in cho **${gameName}**...`);

    try {
        const responseMessage = await autoCheckIn(userId, game === "all" ? null : game, userProfiles);
        await interaction.editReply(responseMessage);
    } catch (error) {
        console.error(`📌[ERROR] Lỗi khi check-in:`, error);
        await interaction.editReply("❌ Đã xảy ra lỗi khi check-in.");
    }
}

module.exports = { handleCheckinCommand, handleCheckinButton };
