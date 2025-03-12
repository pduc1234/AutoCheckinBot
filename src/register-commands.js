require("dotenv").config();
const { SlashCommandBuilder, REST, Routes } = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Just say 'Hello!' back"),
    new SlashCommandBuilder()
        .setName("settoken")
        .setDescription("Thiết lập token của bạn")
        .addStringOption(option =>
            option.setName("value").setDescription("Token Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("setuid")
        .setDescription("Thiết lập UID của bạn")
        .addStringOption(option =>
            option.setName("value").setDescription("UID Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("checkin")
        .setDescription("Thực hiện auto check-in Hoyolab"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🛠 Đang cập nhật lệnh slash...");
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands,
        });
        console.log("✅ Lệnh slash đã được cập nhật!");
    } catch (error) {
        console.error("❌ Lỗi khi đăng ký lệnh:", error);
    }
})();
