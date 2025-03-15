const { loadEconomy, saveEconomy } = require("../../utils/file-handler");
const economy = loadEconomy();

const handleRemoveMoney = async (interaction) => {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
        return interaction.reply("❌ You do not have the right to use this command!");
    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (!targetUser) {
        return interaction.reply("❌ Please specify a valid user!");
    }    

    economy[targetUser.id] = Math.max(0, (economy[targetUser.id] || 0) - amount);
    saveEconomy(economy);

    return interaction.reply(
        `✅ Removed ${amount} <:parallel_coin:1350066344632123462> Coin of <@${targetUser.id}>`,
    );
};

module.exports = {
    execute: handleRemoveMoney
};