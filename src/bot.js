require("dotenv").config();
require("./register-commands");
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    MessageFlags,
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
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

// The locking function from SECRET_KEY
function getKeyFromSecret(secret) {
    return crypto.createHash('sha256').update(secret).digest();
}

// Encrypt function
function encrypt(text) {
    const key = getKeyFromSecret(SECRET_KEY);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + encrypted; 
}

// Decrypt function
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
        console.error("❌ Decrypt Error:", err.message);
        return null;
    }
}

// Load data from auto check-in
let autoCheckinData = {};
if (fs.existsSync(autoCheckinFile)) {
    autoCheckinData = JSON.parse(fs.readFileSync(autoCheckinFile, "utf-8"));
}

// Save data from auto check-in
function saveAutoCheckinData() {
    fs.writeFileSync(autoCheckinFile, JSON.stringify(autoCheckinData, null, 2));
}

// Load data from user data
function loadUserData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }
    return {};
}

// Save data from user data
function saveUserData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const userProfiles = loadUserData();

client.on("ready", () => {
    console.log(`✅ Bot is ready: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton()) return;
    const { commandName } = interaction;
    const userId = interaction.user.id;
    //console.log(`[DEBUG] Interactions from user: ${interaction.user.id}, type: ${interaction.type}`);

    if (interaction.isCommand()){
        const { commandName } = interaction;

        if (commandName === "hello") {
            await interaction.reply({ content: `Hello! 👋`, flags: MessageFlags.Ephemeral });
        }

        if (commandName === "settoken") {
            const tokenValue = interaction.options.getString("value");
        
            if (!tokenValue) {
                await interaction.reply({ content: "⚠️ Please enter a valid token!", flags: MessageFlags.Ephemeral });
                return;
            }
        
            userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
            userProfiles[interaction.user.id].token = encrypt(tokenValue);
            saveUserData(userProfiles);
        
            await interaction.reply({ content: "✅ Token saved!", flags: MessageFlags.Ephemeral });
        }

        if (commandName === "setuid") {
            const uidValue = interaction.options.getString("value");
        
            if (!uidValue) {
                await interaction.reply({ content: "⚠️ Please enter a valid UID!", flags: MessageFlags.Ephemeral });
                return;
            }
        
            userProfiles[interaction.user.id] = userProfiles[interaction.user.id] || {};
            userProfiles[interaction.user.id].uid = encrypt(uidValue);
            saveUserData(userProfiles);
        
            await interaction.reply({ content: "✅ UID saved!", flags: MessageFlags.Ephemeral });
        }
        if (commandName === "autocheckin") {
            const userId = interaction.user.id;
            const enabled = interaction.options.getBoolean("enable");
            const selectedGames = interaction.options.getString("games")?.split(",").map(game => game.trim()) || [];
    
            // If there is no user in data, create new
            if (!autoCheckinData[userId]) {
                autoCheckinData[userId] = { enabled: false, games: [] };
            }
    
            // Update Auto Check-in status
            autoCheckinData[userId].enabled = enabled;
            if (selectedGames.length > 0) {
                autoCheckinData[userId].games = selectedGames;
            }
    
            saveAutoCheckinData();
    
            await interaction.reply({
                content: `✅ Auto mode is **${enabled ? "ON" : "OFF"}**.\n🎮 Game check-in: ${selectedGames.length > 0 ? selectedGames.join(", ") : "No changed"}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (commandName === "checkin") {
            const userId = interaction.user.id;
            // console.log(`[DEBUG] Interaction checkin from user: ${userId}`);

            if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
                // console.log(`[DEBUG] Lack of tokens or UID for user: ${userId}`);
                await interaction.reply({ content: "⚠️  You need to set the token and UID first!", flags: MessageFlags.Ephemeral });
                return;
            }

            // Send Embed
            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("🎮 Choose Game to Check-in!")
                .setDescription("Click the button below to select the game you want to check-in.")
                .setTimestamp();

            // Create Button
            const row = new ActionRowBuilder();
            Object.keys(urlDict).forEach((game) => {
                // console.log(`[DEBUG] Create Button: ${game}`);
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`checkin_${game}_${userId}`)
                        .setLabel(game.replace("_", " "))
                        .setStyle(ButtonStyle.Primary)
                );
            });

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`checkin_all_${userId}`)
                    .setLabel("All Game")
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }
    }
    // Button event handle
    else if (interaction.isButton()) {
        // console.log(`[DEBUG] Buttons clicked by the user.: ${interaction.user.id}, customId: ${interaction.customId}`);

        const customId = interaction.customId;
        if (!customId.startsWith("checkin_")) return;

        const lastUnderscoreIndex = customId.lastIndexOf("_");
        if (lastUnderscoreIndex === -1) {
            console.log(`[ERROR] Customid incorrect format: ${customId}`);
            return;
        }
        const game = customId.substring(8, lastUnderscoreIndex); // Remove "checkin_" (first 8 characters)
        const userIdFromButton = customId.substring(lastUnderscoreIndex + 1);
        const userId = interaction.user.id;

        if (userId !== userIdFromButton) {
            // console.log(`[DEBUG] User ${userId} does not match the user in the node: ${userIdFromButton}`);
            await interaction.reply({ content: "⚠️ You cannot press this button!", flags: MessageFlags.Ephemeral });
            return;
        }

        const gameName = game === "all" ? "All Game" : game.replace("_", " ");
        // console.log(`[DEBUG] Start check-in for: ${gameName}`);

        await interaction.reply(`🔄 Auto check-in... **${gameName}**...`);

        try {
            const responseMessage = await autoCheckIn(userId, game === "all" ? null : game);
            // console.log(`[DEBUG] Check-in results: ${responseMessage}`);
            await interaction.editReply(responseMessage);
        } catch (error) {
            console.error(`[ERROR] Check-in Error:`, error);
            await interaction.editReply("❌ Something went wrong while checking in.");
        }
    }
});

async function autoCheckIn(userId) {
    if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
        return `⚠️ <@${userId}>, You have not set up tokens or UID!`;
    }

    let token = decrypt(userProfiles[userId].token);
    let uid = decrypt(userProfiles[userId].uid);
    // console.log("[DEBUG] Decrypted Token:", token);
    // console.log("[DEBUG] Decrypted UID:", uid);

    if (!token || !uid) {
        return `❌ Error when decoding tokens/UID. Please reset by /settoken and /setuid.`;
    }

    const headers = {
        Cookie: `ltoken_v2=${token}; ltuid_v2=${uid};`,
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "x-rpc-client_type": "4",
        Referer: "https://act.hoyolab.com/",
        Origin: "https://act.hoyolab.com"
    };

    let responseText = `📌 **Check-in results for <@${userId}>:**`;

    if (game) {
        if (!urlDict[game]) {
            return `⚠️ Game **${game}** invalid!`;
        }
        return await checkInGame(userId, game, headers);
    } else {
        for (const [gameKey, url] of Object.entries(urlDict)) {
            responseText += `\n${await checkInGame(userId, gameKey, headers)}`;
        }
    }

    return responseText;
}

async function checkInGame(userId, game, headers) {
    try {
        headers["x-rpc-signgame"] = game.toLowerCase();
        const res = await axios.post(urlDict[game], {}, { headers });
        return `${res.data.message === "OK" ? "✅" : "❌"} **${game}**: ${res.data.message}`;
    } catch (error) {
        return `⚠️ **${game}**: Cannot check-in.`;
    }
}

// Auto check-in every day at 12PM
cron.schedule("0 12 * * *", async () => {
    console.log("🔄 Auto check-in...");
    for (const userId in userProfiles) {
        if (userProfiles[userId].autoCheckIn?.active) {
            const game = userProfiles[userId].autoCheckIn.game;
            const result = await autoCheckIn(userId, game);
            client.users.fetch(userId).then(user => user.send(result)).catch(() => {});
        }
    }
}, { timezone: "Asia/Ho_Chi_Minh" });

client.login(process.env.TOKEN);
