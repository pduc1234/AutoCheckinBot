const fs = require("fs");
const { DATA_FILE, AUTO_CHECKIN_FILE, ECONOMY_FILE } = require("../config");

function loadUserData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
    return {};
}

function saveUserData(data) {
    if (!data) {
        console.error("❌[ERROR] Unable to save because the data is invalid:", data);
        return;
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function loadAutoCheckinData() {
    if (fs.existsSync(AUTO_CHECKIN_FILE)) {
        return JSON.parse(fs.readFileSync(AUTO_CHECKIN_FILE, "utf-8"));
    }
    return {};
}

function saveAutoCheckinData(data) {
    if (!data) {
        console.error("❌[ERROR] Unable to save because the data is invalid:", data);
        return;
    }
    fs.writeFileSync(AUTO_CHECKIN_FILE, JSON.stringify(data, null, 2));
}

function loadEconomy() {
    if (fs.existsSync(ECONOMY_FILE)) {
        return JSON.parse(fs.readFileSync(ECONOMY_FILE));
    }
    return {};
}

function saveEconomy(data) {
    if (!data) {
        console.error("❌[ERROR] Unable to save because the data is invalid:", data);
        return;
    }
    fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadUserData, saveUserData, loadAutoCheckinData, saveAutoCheckinData, loadEconomy, saveEconomy };
