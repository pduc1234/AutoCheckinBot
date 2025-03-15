require("dotenv").config();
require("./register-commands");
const { Client, GatewayIntentBits } = require("discord.js");
const { handleCheckinCommand, handleCheckinButton } = require("./commands/check-in/checkin");
const { handleAutoCheckinCommand } = require("./commands/check-in/autocheckin");
const { handleBlackjack, handleBlackjackButton } = require("./commands/games/blackjack");
const { loadUserData } = require("./utils/file-handler");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const userProfiles = loadUserData();

client.on("ready", () => {
    console.log(`✅ Bot is ready: ${client.user.tag}`);
});

/*
client.on("debug", console.log);
client.on("warn", console.warn);
client.on("error", console.error);
*/

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === "hello") {
            // console.log("📢[DEBUG] Handle hello command...");
            const { execute } = require("./commands/hello");
            await execute(interaction);
        } else if (commandName === "autocheckin") {
            // console.log("📢[DEBUG] Handle auto-checkin command...");
            await handleAutoCheckinCommand(interaction);
        } else if (commandName === "checkin") {
            // console.log("📢[DEBUG] Handle checkin command...");
            await handleCheckinCommand(interaction, userProfiles);
        } else if (commandName === "settoken") {
            // console.log("📢[DEBUG] Handle set-token command...");
            const { execute } = require("./commands/check-in/settoken");
            await execute(interaction);
        } else if (commandName === "setuid") {
            // console.log("📢[DEBUG] Handle set-uid command...");
            const { execute } = require("./commands/check-in/setuid");
            await execute(interaction);
        } else if (commandName === "addmoney") {
            // console.log("📢[DEBUG] Handle add-money command...");
            const { execute } = require("./commands/admin/add-money");
            await execute(interaction);
        } else if (commandName === "removemoney") {
            // console.log("📢[DEBUG] Handle remove-money...");
            const { execute } = require("./commands/admin/remove-money");
            await execute(interaction);
        } else if (commandName === "balance") {
            // console.log("📢[DEBUG] Handle balance...");
            const { execute } = require("./commands/economy/balance");
            await execute(interaction);
        } else if (commandName === "daily") {
            // console.log("📢[DEBUG] Handle daily...");
            const { execute } = require("./commands/economy/daily");
            await execute(interaction);
        } else if (commandName === "give") {
            // console.log("📢[DEBUG] Handle give...");
            const { execute } = require("./commands/economy/give");
            await execute(interaction);
        } else if (commandName === "work") {
            // console.log("📢[DEBUG] Handle work...");
            const { execute } = require("./commands/economy/work");
            await execute(interaction);
        } else if (commandName === "blackjack") {
            // console.log("📢[DEBUG] Handle blackjack...");
            await handleBlackjack(interaction);
        } else if (commandName === "dice") {
            // console.log("📢[DEBUG] Handle dice...");
            const { execute } = require("./commands/games/dice");
            await execute(interaction);
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith("blackjack_")) {
            // console.log("📢[DEBUG] Handle Blackjack button...");
            await handleBlackjackButton(interaction);
        } else {
            // console.log("📢[DEBUG] Handle Check-in button...");
            await handleCheckinButton(interaction, userProfiles);
        }
    }
    
});

client.login(process.env.TOKEN);
