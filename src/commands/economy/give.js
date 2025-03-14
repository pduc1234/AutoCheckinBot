const { loadEconomy, saveEconomy } = require("../../utils/file-handler");

const economy = loadEconomy()

const handleGive = async (interaction) => {
    const userId = interaction.user.id;
    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if ((economy[userId] || 0) < amount) {
        return interaction.reply(
            "❌ Bạn không có đủ tiền! Hãy làm việc để kiếm thêm tiền.",
        );
    }

    economy[userId] -= amount;
    economy[targetUser.id] = (economy[targetUser.id] || 0) + amount;
    saveEconomy(economy);
    return interaction.reply(
        `✅ Bạn đã gửi ${amount} <:parallel_coin:1350066344632123462> cho <@${targetUser.id}>`,
    );
};

module.exports = {
    execute:handleGive
};