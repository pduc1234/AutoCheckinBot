const { loadEconomy, saveEconomy } = require("../../utils/file-handler");
const economy = loadEconomy();

const handleRemoveMoney = async (interaction) => {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
        return interaction.reply("❌ Bạn không có quyền sử dụng lệnh này!");

    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (!targetUser) {
        return interaction.reply("❌ Vui lòng chỉ định một người dùng hợp lệ!");
    }    

    economy[targetUser.id] = Math.max(0, (economy[targetUser.id] || 0) - amount);
    saveEconomy(economy);

    return interaction.reply(
        `✅ Đã xoá ${amount} <:parallel_coin:1350066344632123462> Coin của <@${targetUser.id}>`,
    );
};

module.exports = {
    execute: handleRemoveMoney
};