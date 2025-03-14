require("dotenv").config();
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🗑 Đang xóa tất cả lệnh slash...");

        // Lấy danh sách các lệnh hiện có
        const commands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));

        if (commands.length === 0) {
            console.log("✅ Không có lệnh nào để xóa!");
            return;
        }

        for (const command of commands) {
            await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
            console.log(`🗑 Đã xóa lệnh: ${command.name}`);
        }

        console.log("✅ Đã xóa tất cả lệnh slash thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi xóa lệnh:", error);
    }
})();
