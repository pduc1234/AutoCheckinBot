const { MessageFlags } = require("discord.js")
const { encrypt } = require("../../utils/encryption");
const { loadUserData, saveUserData } = require("../../utils/file-handler");

const handleSettoken = async (interaction) => {
    // console.log("📢 The /settoken command has been called!");
    const tokenValue = interaction.options.getString("value");
    if (!tokenValue) {
        await interaction.reply({ content: "⚠️ Please enter a valid token!", flags: MessageFlags.Ephemeral });
        return;
    }

    const userProfiles = loadUserData();
    userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
    userProfiles[interaction.user.id].token = encrypt(tokenValue);
    saveUserData(userProfiles);
    await interaction.reply({ content: "✅ Token has been saved!", flags: MessageFlags.Ephemeral });

}


module.exports = {
    execute: handleSettoken
};
