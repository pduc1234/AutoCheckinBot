const axios = require("axios");
const cron = require("node-cron");
const { decrypt } = require("./encryption")
const { loadUserData, saveUserData } = require("./file-handler");

const userProfiles = loadUserData();

const urlDict = {
    ZZZ: "https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091",
    Genshin: "https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481",
    Star_Rail: "https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311",
    Honkai_3: "https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111"
};

async function autoCheckIn(userId, game = null) {
    if (!userProfiles[userId] || !userProfiles[userId].token || !userProfiles[userId].uid) {
        return `⚠️ <@${userId}>, you have not set up token or UID!`;
    }

    let token = decrypt(userProfiles[userId].token);
    let uid = decrypt(userProfiles[userId].uid);
    // console.log("📢[DEBUG] Decrypted Token:", token);
    // console.log("📢[DEBUG] Decrypted UID:", uid);

    if (!token || !uid) {
        return `❌ Error when decrypting token/UID. Please reset with /settoken and /setuid.`;
    }

    const headers = {
        Cookie: `ltoken_v2=${token}; ltuid_v2=${uid};`,
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "x-rpc-client_type": "4",
        Referer: "https://act.hoyolab.com/",
        Origin: "https://act.hoyolab.com"
    };

    if (game) {
        if (!urlDict[game]) {
            return `⚠️ Game **${game}** invalid!`;
        }
        return await checkInGame(userId, game, headers);
    } else {
        let responseText = `📌 **Check-in results for <@${userId}>:**`;
        for (const gameKey of Object.keys(urlDict)) {
            responseText += `\n${await checkInGame(userId, gameKey, headers)}`;
        }
        return responseText;
    }
}

async function checkInGame(userId, game, headers) {
    try {
        headers["x-rpc-signgame"] = game.toLowerCase();
        const res = await axios.post(urlDict[game], {}, { headers });
        return `${res.data.message === "OK" ? "✅" : "❌"} **${game}**: ${res.data.message}`;
    } catch (error) {
        return `⚠️ **${game}**: Unable to check-in.`;
    }
}

// Schedule auto check-in every day at 10AM
cron.schedule("0 10 * * *", async () => {
    console.log("🔄 Auto checking-in...");
    for (const userId in userProfiles) {
        if (userProfiles[userId].autoCheckIn?.active) {
            const game = userProfiles[userId].autoCheckIn.game;
            const result = await autoCheckIn(userId, game);
            client.users.fetch(userId).then(user => user.send(result)).catch(() => {});
        }
    }
}, { timezone: "Asia/Singapore" });

module.exports = { autoCheckIn, urlDict };