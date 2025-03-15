const fs = require("fs");
const cron = require("node-cron");
const { loadAutoCheckinData, saveAutoCheckinData, loadUserData } = require("../../utils/file-handler");

const userProfiles = loadUserData();
const autoCheckinData = loadAutoCheckinData();

const handleAutoCheckinCommand = async (interaction) => {
    // console.log("📢[DEBUG] The /autocheckin command has been called!");
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
    // console.log("📢[DEBUG] Data is being saved:", autoCheckinData);

    await interaction.reply({
        content: `✅ Auto check-in mode has been **${enabled ? "ON" : "OFF"}**.\n🎮 Game check-in: **${selectedGames.length > 0 ? selectedGames.join(", ") : "No change"}**`,
        flags: 64,
    });
};

// Auto check-in function
const autoCheckIn = async (userId, game) => {
    console.log(`✅ User ${userId} has auto checked-in into the game ${game}!`);
    return `✅ User ${userId} has auto check-in to game ${game}!`;
};

// Run auto check-in every day at 10AM
module.exports = (client) => {
    cron.schedule("0 10 * * *", async () => {
        console.log("🔄 Doing auto check-in...");
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
