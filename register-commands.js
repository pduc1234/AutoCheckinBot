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
            option.setName("value")
            .setDescription("Token Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("setuid")
        .setDescription("Thiết lập UID của bạn")
        .addStringOption(option =>
            option.setName("value")
            .setDescription("UID Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("checkin")
        .setDescription("Thực hiện auto check-in Hoyolab"),
    new SlashCommandBuilder()
        .setName("autocheckin")
        .setDescription("Bật/tắt auto check-in và chọn game")
        .addStringOption(option =>
            option.setName("mode")
                .setDescription("Bật hoặc tắt chế độ auto check-in")
                .setRequired(true)
                .addChoices(
                    { name: "Bật", value: "on" },
                    { name: "Tắt", value: "off" }
                )
        )
        .addStringOption(option =>
            option.setName("games")
                .setDescription("Nhập tên game để check-in tự động (cách nhau bởi dấu phẩy, VD: Genshin,Honkai_3)")
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName("addmoney")
        .setDescription("Cộng thêm số dư (Admin only)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Chọn người dùng để gửi tiền")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Số tiền")
                .setRequired(true),
        ),
    new SlashCommandBuilder()
        .setName("removemoney")
        .setDescription("Trừ bớt số dư (Admin only)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Chọn người dùng để gửi tiền")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Nhập số tiền")
                .setRequired(true),
        ),
    new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Xem số dư của bạn"),
    new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Điểm danh hàng ngày và nhận thưởng"),
    new SlashCommandBuilder()
        .setName("give")
        .setDescription("Chuyển tiền cho người khác")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Chọn người dùng để gửi tiền")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Nhập số tiền")
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName("work")
        .setDescription("Lao động là vinh quang +100 Coin"),
    new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Bắt đầu trò chơi Blackjack!")
        .addIntegerOption((option) =>
            option
                .setName("bet")
                .setDescription("Số tiền cược")
                .setMinValue(1000),
        ),
    new SlashCommandBuilder()
        .setName("dice")
        .setDescription("Bắt đầu trò chơi Dice!")
        .addIntegerOption((option) =>
            option
                .setName("bet")
                .setDescription("Số tiền cược")
                .setMinValue(1000),
        ),
    
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
