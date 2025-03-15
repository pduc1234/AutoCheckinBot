const { loadEconomy, saveEconomy } = require("../../utils/file-handler");

const economy = loadEconomy();
const cooldowns = new Map();

const handleWork = async (interaction) => {
    const userId = interaction.user.id;
    if (
        cooldowns.has(`work_${userId}`) &&
        Date.now() - cooldowns.get(`work_${userId}`) < 600000
    ) {
        return interaction.reply(
            "❌ You have to wait 10 minutes before continuing!",
        );
    }
    economy[userId] = (economy[userId] || 0) + 500;
    cooldowns.set(`work_${userId}`, Date.now());
    saveEconomy(economy);
    return interaction.reply("💼 You worked and received 500 <:parallel_coin:1350066344632123462>!");
};

module.exports = {
    execute: handleWork
};