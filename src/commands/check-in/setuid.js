const { MessageFlags } = require("discord.js")
const { encrypt } = require("../../utils/encryption");
const { loadUserData, saveUserData } = require("../../utils/file-handler");

const handleSetuid = async(interaction) => {
    // console.log("📢 The /setuid command has been called!");
    const uidValue = interaction.options.getString("value");
        if (!uidValue) {
            await interaction.reply({ content: "⚠️ Please enter a valid UID!", flags: MessageFlags.Ephemeral });
            return;
        }

        const userProfiles = loadUserData();
        userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
        userProfiles[interaction.user.id].uid = encrypt(uidValue);
        saveUserData(userProfiles);

        await interaction.reply({ content: "✅ UID has been saved!", flags: MessageFlags.Ephemeral });
}

module.exports = {
    execute:handleSetuid
};
