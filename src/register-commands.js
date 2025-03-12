require("dotenv").config();
const { SlashCommandBuilder, REST, Routes } = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Just say 'Hello!' back"),
    new SlashCommandBuilder()
        .setName("settoken")
        .setDescription("Set your token")
        .addStringOption(option =>
            option.setName("value").setDescription("Token Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("setuid")
        .setDescription("Set your UID")
        .addStringOption(option =>
            option.setName("value").setDescription("UID Hoyolab").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("checkin")
        .setDescription("Auto check-in Hoyolab"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🛠 Updating the slash command ...");
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands,
        });
        console.log("✅ Slash command has been updated!");
    } catch (error) {
        console.error("❌ Error when registering:", error);
    }
})();
