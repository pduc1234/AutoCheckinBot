require("dotenv").config();
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🗑 Deleting the slash...");

        // Get a list of existing commands
        const commands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));

        if (commands.length === 0) {
            console.log("✅ There are no commands to delete!");
            return;
        }

        for (const command of commands) {
            await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
            console.log(`🗑 Deleted: ${command.name}`);
        }

        console.log("✅ Deleteed all Slash commands successfully!");
    } catch (error) {
        console.error("❌ Error when delete Slash:", error);
    }
})();
