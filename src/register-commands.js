require("dotenv").config();
const { SlashCommandBuilder, REST, Routes } = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Just say 'Hello!' back"),
    new SlashCommandBuilder()
        .setName("settoken")
        .setDescription("Set up your token")
        .addStringOption(option =>
            option.setName("value")
            .setDescription("Token Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("setuid")
        .setDescription("Set up your UID")
        .addStringOption(option =>
            option.setName("value")
            .setDescription("UID Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("checkin")
        .setDescription("Perform auto check-in Hoyolab"),
    new SlashCommandBuilder()
        .setName("autocheckin")
        .setDescription("Turn on/off auto check-in and select game")
        .addStringOption(option =>
            option.setName("mode")
                .setDescription("Turn on or off auto check-in mode")
                .setRequired(true)
                .addChoices(
                    { name: "On", value: "on" },
                    { name: "Off", value: "off" }
                )
        )
        .addStringOption(option =>
            option.setName("games")
                .setDescription("Enter the game name for automatic check-in (separated by commas, E.g.: Genshin,Honkai_3)")
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName("addmoney")
        .setDescription("Add the balance (Admin only)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Choose a user to add money")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Enter the amount")
                .setRequired(true),
        ),
    new SlashCommandBuilder()
        .setName("removemoney")
        .setDescription("Remove the balance (Admin only)")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Choose a user to remove money")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Enter the amount")
                .setRequired(true),
        ),
    new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your balance"),
    new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Daily check-in and receive rewards"),
    new SlashCommandBuilder()
        .setName("give")
        .setDescription("Transfer money to others")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Choose a user to send money")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Enter the amount")
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName("work")
        .setDescription("Labor is glory +100 Coin"),
    new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Start the Blackjack game!")
        .addIntegerOption((option) =>
            option
                .setName("bet")
                .setDescription("Enter the Bet amount")
                .setMinValue(1000),
        ),
    new SlashCommandBuilder()
        .setName("dice")
        .setDescription("Start the Dice game!")
        .addIntegerOption((option) =>
            option
                .setName("bet")
                .setDescription("Enter the Bet amount")
                .setMinValue(1000),
        ),
    
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🛠 Updating slash command...");
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands,
        });
        console.log("✅ The slash command has been updated!");
    } catch (error) {
        console.error("❌ Error when registering the order:", error);
    }
})();
