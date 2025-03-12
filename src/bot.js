require("dotenv").config();
require("./register-commands");
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    MessageFlags,
    Routes,
} = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

const SECRET_KEY = process.env.SECRET_KEY;
const DATA_FILE = "user_data.json";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const urlDict = {
    ZZZ: "https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091",
    Genshin: "https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481",
    Star_Rail: "https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311",
    Honkai_3: "https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111"
};

// Hàm tạo khóa từ SECRET_KEY
function getKeyFromSecret(secret) {
    return crypto.createHash('sha256').update(secret).digest();
}

// Hàm mã hóa
function encrypt(text) {
    const key = getKeyFromSecret(SECRET_KEY);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + encrypted; 
}

// Hàm giải mã
function decrypt(encrypted) {
    if (!encrypted) return null;

    try {
        const key = getKeyFromSecret(SECRET_KEY);
        const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
        const encryptedText = encrypted.slice(32);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error("❌ Lỗi giải mã:", err.message);
        return null;
    }
}

function loadUserData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }
    return {};
}

function saveUserData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const userProfiles = loadUserData();

client.on("ready", () => {
    console.log(`✅ Bot đã hoạt động: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === "hello") {
        await interaction.reply({ content: `Xin chào, ${interaction.user.username}! 👋`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === "settoken") {
        const tokenValue = interaction.options.getString("value");
    
        if (!tokenValue) {
            await interaction.reply({ content: "⚠️ Vui lòng nhập token hợp lệ!", flags: MessageFlags.Ephemeral });
            return;
        }
    
        userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
        userProfiles[interaction.user.id].token = encrypt(tokenValue);
        saveUserData(userProfiles);
    
        await interaction.reply({ content: "✅ Token đã được lưu!", flags: MessageFlags.Ephemeral });
    }

    if (commandName === "setuid") {
        const uidValue = interaction.options.getString("value");
    
        if (!uidValue) {
            await interaction.reply({ content: "⚠️ Vui lòng nhập UID hợp lệ!", flags: MessageFlags.Ephemeral });
            return;
        }
    
        userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
        userProfiles[interaction.user.id].uid = encrypt(uidValue);
        saveUserData(userProfiles);
    
        await interaction.reply({ content: "✅ UID đã được lưu!", flags: MessageFlags.Ephemeral });
    }

    if (commandName === "checkin") {
        const userId = interaction.user.id;
        if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
            await interaction.reply({ content: "⚠️ Bạn cần thiết lập token và UID trước!", flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.reply("🔄 Đang thực hiện auto check-in...");
        const responseMessages = await autoCheckIn(userId);
        await interaction.editReply(responseMessages);
    }
});

async function autoCheckIn(userId) {
    if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
        return `⚠️ <@${userId}>, bạn chưa thiết lập token hoặc UID!`;
    }

    let token = decrypt(userProfiles[userId].token);
    let uid = decrypt(userProfiles[userId].uid);
    // console.log("Decrypted Token:", token);
    // console.log("Decrypted UID:", uid);

    if (!token || !uid) {
        return `❌ Lỗi khi giải mã token/UID. Hãy thiết lập lại bằng /settoken và /setuid.`;
    }

    const headers = {
        Cookie: `ltoken_v2=${token}; ltuid_v2=${uid};`,
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "x-rpc-client_type": "4",
        Referer: "https://act.hoyolab.com/",
        Origin: "https://act.hoyolab.com"
    };

    let responseText = `📌 **Check-in kết quả cho <@${userId}>:**`;

    for (const [game, url] of Object.entries(urlDict)) {
        try {
            headers["x-rpc-signgame"] = game.toLowerCase();
            const res = await axios.post(url, {}, { headers });
            // console.log("API Response:", res.data);
            const result = res.data.message;
            responseText += `\n${result === "OK" ? "✅" : "❌"} **${game}**: ${result}`;
        } catch (error) {
            // console.error("Lỗi API:", error);
            responseText += `\n⚠️ **${game}**: Không thể thực hiện check-in.`;
        }
    }

    return responseText;
}

client.login(process.env.TOKEN);
