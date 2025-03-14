const { MessageFlags } = require("discord.js")
const { encrypt } = require("../../utils/encryption");
const { loadUserData, saveUserData } = require("../../utils/file-handler");

const handleSetuid = async(interaction) => {
    // console.log("📢 Lệnh /setuid đã được gọi!");
    const uidValue = interaction.options.getString("value");
        if (!uidValue) {
            await interaction.reply({ content: "⚠️ Vui lòng nhập UID hợp lệ!", flags: MessageFlags.Ephemeral });
            return;
        }

        const userProfiles = loadUserData();
        userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
        userProfiles[interaction.user.id].uid = encrypt(uidValue);
        saveUserData(userProfiles);

        await interaction.reply({ content: "✅ UID đã được lưu!", flags: MessageFlags.Ephemeral });
}

module.exports = {
    execute:handleSetuid
};
