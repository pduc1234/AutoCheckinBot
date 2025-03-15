const { loadEconomy, saveEconomy } = require("../../utils/file-handler");

const economy = loadEconomy()

const handleGive = async (interaction) => {
    const userId = interaction.user.id;
    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if ((economy[userId] || 0) < amount) {
        return interaction.reply(
            "❌ You don't have enough money! Let's work to earn more money.",
        );
    }

    economy[userId] -= amount;
    economy[targetUser.id] = (economy[targetUser.id] || 0) + amount;
    saveEconomy(economy);
    return interaction.reply(
        `✅ You have sent ${amount} <:parallel_coin:1350066344632123462> to <@${targetUser.id}>`,

);
};

module.exports = {
    execute:handleGive
};