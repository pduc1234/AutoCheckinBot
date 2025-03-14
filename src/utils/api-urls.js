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
        return `⚠️ <@${userId}>, bạn chưa thiết lập token hoặc UID!`;
    }

    let token = decrypt(userProfiles[userId].token);
    let uid = decrypt(userProfiles[userId].uid);
    // console.log("📢[DEBUG] Decrypted Token:", token);
    // console.log("📢[DEBUG] Decrypted UID:", uid);

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

    if (game) {
        if (!urlDict[game]) {
            return `⚠️ Game **${game}** không hợp lệ!`;
        }
        return await checkInGame(userId, game, headers);
    } else {
        let responseText = `📌 **Kết quả check-in cho <@${userId}>:**`;
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
        return `⚠️ **${game}**: Không thể thực hiện check-in.`;
    }
}

// Lên lịch auto check-in mỗi ngày lúc 12h trưa
cron.schedule("0 12 * * *", async () => {
    console.log("🔄 Đang chạy auto check-in...");
    for (const userId in userProfiles) {
        if (userProfiles[userId].autoCheckIn?.active) {
            const game = userProfiles[userId].autoCheckIn.game;
            const result = await autoCheckIn(userId, game);
            client.users.fetch(userId).then(user => user.send(result)).catch(() => {});
        }
    }
}, { timezone: "Asia/Ho_Chi_Minh" });

module.exports = { autoCheckIn, urlDict };