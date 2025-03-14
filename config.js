require("dotenv").config();

module.exports = {
    SECRET_KEY: process.env.SECRET_KEY,
    DATA_FILE: "user-data.json",
    AUTO_CHECKIN_FILE: "auto-checkin.json",
    ECONOMY_FILE: "economy.json",
};
