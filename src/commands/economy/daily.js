const { loadEconomy, saveEconomy } = require("../../utils/file-handler");

const economy = loadEconomy();
const cooldowns = new Map();

const handleDaily = async (interaction) => {
    const userId = interaction.user.id;
    if (
        cooldowns.has(userId) &&
        Date.now() - cooldowns.get(userId) < 86400000
    ) {
        return interaction.reply(
            "❌ You have received the bonus today, please come back in 24 hours!",
        );
    }
    economy[userId] = (economy[userId] || 0) + 5000;
    cooldowns.set(userId, Date.now());
    saveEconomy(economy);
    return interaction.reply(
        "🎁 You have received 1000 <:parallel_coin:1350066344632123462> daily bonus!",
    );
};

module.exports = {
    execute: handleDaily
};