const { MessageFlags } = require("discord.js")
const { encrypt } = require("../../utils/encryption");
const { loadUserData, saveUserData } = require("../../utils/file-handler");

const handleSettoken = async (interaction) => {
    // console.log("📢 Lệnh /settoken đã được gọi!");
    const tokenValue = interaction.options.getString("value");
    if (!tokenValue) {
        await interaction.reply({ content: "⚠️ Vui lòng nhập token hợp lệ!", flags: MessageFlags.Ephemeral });
        return;
    }

    const userProfiles = loadUserData();
    userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
    userProfiles[interaction.user.id].token = encrypt(tokenValue);
    saveUserData(userProfiles);
    await interaction.reply({ content: "✅ Token đã được lưu!", flags: MessageFlags.Ephemeral });

}


module.exports = {
    execute: handleSettoken
};
