const { loadEconomy } = require("../../utils/file-handler")

const economy = loadEconomy()

const handleBalance = async (interaction) => {
    const userId = interaction.user.id;
    return interaction.reply(
        `**💰 Số dư của bạn:** ${economy[userId] || 0} <:parallel_coin:1350066344632123462>`,
    );
};

module.exports = {
    execute:handleBalance
};