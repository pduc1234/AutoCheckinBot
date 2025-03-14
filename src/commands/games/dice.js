const { loadEconomy, saveEconomy } = require("../../utils/file-handler");
const { diceStickers } = require("../../utils/dict");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require("discord.js");

const economy = loadEconomy();

const handleDice = async (interaction) => {
    const userId = interaction.user.id;
    let bet = interaction.options.getInteger("bet") || 1000;

    if (!economy[userId] || economy[userId] < bet) {
        return interaction.reply(
            "❌ Bạn không đủ tiền để chơi Dice! Hãy làm việc để kiếm thêm tiền.",
        );
    }

    economy[userId] -= bet;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎲 Đặt cược xúc xắc!")
        .setDescription(`💰 **Số tiền cược:** ${bet} <:parallel_coin:1350066344632123462>\n\n➡️ **Chọn Tài hoặc Xỉu**:`);
    
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("bet_tai").setLabel("Tài").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("bet_xiu").setLabel("Xỉu").setStyle(ButtonStyle.Danger)
        );
    
    const message = await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    
    // Bộ lọc chờ phản hồi từ người chơi
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 15000 });
    
    collector.on("collect", async (i) => {
        const betChoice = i.customId === "bet_tai" ? "Tài" : "Xỉu";
    
        let results = "";
        let total = 0;
    
        // Hiệu ứng tung xúc xắc từng bước
        for (let j = 0; j < 3; j++) {
            const diceRoll = Math.floor(Math.random() * 6) + 1;
            total += diceRoll;
            results += `${diceStickers[diceRoll]} `;
    
            // Cập nhật từng bước
            const rollingEmbed = new EmbedBuilder()
                .setColor("#FFD700")
                .setTitle("🎲 Kết quả tung xúc xắc!")
                .setDescription(`**Kết quả hiện tại:**\n${results.trim()}`)
                .setFooter({ text: "Đang tung tiếp...", iconURL: "https://cdn.discordapp.com/emojis/1350014673612836916.png" });
    
            await interaction.editReply({ embeds: [rollingEmbed], components: [] });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    
        // Xác định kết quả
        const gameResult = total > 10 ? "Tài" : "Xỉu";
        const isWin = betChoice === gameResult;
        const winnings = isWin ? bet + Math.floor(bet * 0.9) : 0;
    
        // Cập nhật kết quả cuối cùng
        const finalEmbed = new EmbedBuilder()
            .setColor(isWin ? "#00FF00" : "#FF0000")
            .setTitle("🎲 Kết quả tung xúc xắc!")
            .setDescription(`**Kết quả:**\n${results.trim()}\n\n🔢 **Tổng điểm: ${total}**\n➡️ **${gameResult}**`)
            .addFields(
                { name: "💰 Tiền cược", value: `${bet} <:parallel_coin:1350066344632123462>`, inline: true },
                { name: "📊 Kết quả", value: isWin ? "🎉 **Bạn thắng!** 🤑" : "💸 **Bạn thua!** 😢", inline: true },
                { name: "<a:coinloop:1350066419710038098> Tiền nhận", value: isWin ? `${winnings} <:parallel_coin:1350066344632123462>` : "0 <:parallel_coin:1350066344632123462>", inline: true }
            );
    
            await interaction.editReply({ embeds: [finalEmbed], components: [] });
        });
    
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "⏳ **Bạn không chọn trong thời gian quy định!**", components: [] });
            }
        });
};

module.exports = {
    execute: handleDice
};