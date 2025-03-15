const { loadEconomy, saveEconomy } = require("../../utils/file-handler");
const { diceStickers } = require("../../utils/dict");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require("discord.js");

const economy = loadEconomy();

const handleDice = async (interaction) => {
    const userId = interaction.user.id;
    let bet = interaction.options.getInteger("bet") || 1000;

    if (!economy[userId] || economy[userId] < bet) {
        return interaction.reply(
            "❌ You don't have enough money to play Dice! Let's work to earn more money.",
        );
    }

    economy[userId] -= bet;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎲 Bet on dice!")
        .setDescription(`💰 **Bet amount:** ${bet} <:parallel_coin:1350066344632123462>\n\n➡️ **Choose Big or Small**:`);
    
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("bet_tai").setLabel("Big").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("bet_xiu").setLabel("Small").setStyle(ButtonStyle.Danger)
        );
    
    const message = await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    
    // Filter waiting for feedback from players
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 15000 });
    
    collector.on("collect", async (i) => {
        const betChoice = i.customId === "bet_tai" ? "Big" : "Small";
    
        let results = "";
        let total = 0;
    
        // Step-by-step dice throwing effect
        for (let j = 0; j < 3; j++) {
            const diceRoll = Math.floor(Math.random() * 6) + 1;
            total += diceRoll;
            results += `${diceStickers[diceRoll]} `;
    
            // Cập nhật từng bước
            const rollingEmbed = new EmbedBuilder()
                .setColor("#FFD700")
                .setTitle("🎲 The result of throwing dice!")
                .setDescription(`**Current results:**\n${results.trim()}`)
                .setFooter({ text: "Throwing...", iconURL: "https://cdn.discordapp.com/emojis/1350014673612836916.png" });
    
            await interaction.editReply({ embeds: [rollingEmbed], components: [] });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    
        // Determine the result
        const gameResult = total > 10 ? "Big" : "Small";
        const isWin = betChoice === gameResult;
        const winnings = isWin ? bet + Math.floor(bet * 0.9) : 0;
    
        // Update the final result
        const finalEmbed = new EmbedBuilder()
            .setColor(isWin ? "#00FF00" : "#FF0000")
            .setTitle("🎲 The result of throwing dice!")
            .setDescription(`**Result:**\n${results.trim()}\n\n🔢 **Total score: ${total}**\n➡️ **${gameResult}**`)
            .addFields(
                { name: "💰 Bet", value: `${bet} <:parallel_coin:1350066344632123462>`, inline: true },
                { name: "📊 Result", value: isWin ? "🎉 **You win!** 🤑" : "💸 **You lose!** 😢", inline: true },
                { name: "<a:coinloop:1350066419710038098> Money received", value: isWin ? `${winnings} <:parallel_coin:1350066344632123462>` : "0 <:parallel_coin:1350066344632123462>", inline: true }
            );
    
            await interaction.editReply({ embeds: [finalEmbed], components: [] });
        });
    
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "⏳ **You don't choose within the specified time!**", components: [] });
            }
        });
};

module.exports = {
    execute: handleDice
};