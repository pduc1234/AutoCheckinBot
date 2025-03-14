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
            "❌ Bạn đã nhận tiền thưởng hôm nay, hãy quay lại sau 24 giờ!",
        );
    }
    economy[userId] = (economy[userId] || 0) + 5000;
    cooldowns.set(userId, Date.now());
    saveEconomy(economy);
    return interaction.reply(
        "🎁 Bạn đã nhận 1000 <:parallel_coin:1350066344632123462> tiền thưởng hàng ngày!",
    );
};

module.exports = {
    execute: handleDaily
};