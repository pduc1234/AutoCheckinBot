const fs = require("fs");
const cron = require("node-cron");
const { loadAutoCheckinData, saveAutoCheckinData, loadUserData } = require("../../utils/file-handler");

const userProfiles = loadUserData();
const autoCheckinData = loadAutoCheckinData();

const handleAutoCheckinCommand = async (interaction) => {
    // console.log("📢[DEBUG] Lệnh /autocheckin đã được gọi!");
    const userId = interaction.user.id;
    const mode = interaction.options.getString("mode");
    const enabled = mode === "on";
    const selectedGames = interaction.options.getString("games")?.split(",").map(game => game.trim()) || [];

    if (!autoCheckinData[userId]) {
        autoCheckinData[userId] = { enabled: false, games: [] };
    }

    autoCheckinData[userId].enabled = enabled;
    if (selectedGames.length > 0) {
        autoCheckinData[userId].games = selectedGames;
    }

    saveAutoCheckinData(autoCheckinData);
    // console.log("📢[DEBUG] Dữ liệu đang lưu:", autoCheckinData);

    await interaction.reply({
        content: `✅ Chế độ auto check-in đã được **${enabled ? "BẬT" : "TẮT"}**.\n🎮 Game check-in: **${selectedGames.length > 0 ? selectedGames.join(", ") : "Không thay đổi"}**`,
        flags: 64,
    });
};

// Hàm auto check-in
const autoCheckIn = async (userId, game) => {
    console.log(`✅ User ${userId} đã auto check-in vào game ${game}!`);
    return `✅ User ${userId} đã auto check-in vào game ${game}!`;
};

// Chạy auto check-in mỗi ngày lúc 10AM
module.exports = (client) => {
    cron.schedule("0 10 * * *", async () => {
        console.log("🔄 Đang thực hiện auto check-in...");
        for (const id in userProfiles) {
            if (userProfiles[id].autoCheckIn?.active) {
                const game = userProfiles[id].autoCheckIn.game;
                const result = await autoCheckIn(id, game);
                client.users.fetch(id).then(user => user.send(result)).catch(() => {});
            }
        }
    }, { timezone: "Asia/Singapore" });
};

module.exports = { handleAutoCheckinCommand, autoCheckIn };
