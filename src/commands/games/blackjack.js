const { createDeck, calculatePoints, cardEmojis } = require("../../utils/dict");
const { loadEconomy, saveEconomy } = require("../../utils/file-handler");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

const economy = loadEconomy();
const games = new Map();

const handleBlackjack = async (interaction) => {
    const userId = interaction.user.id;

    if (games.has(userId)) {
        return await interaction.reply({
            content: "❌ You are playing Blackjack! Let's finish the first hand.",
            flags: MessageFlags.Ephemeral,
        });
    }

    let bet = interaction.options.getInteger("bet") || 1000;

    if (!economy[userId]) {
        economy[userId] = 0; // Initialize the balance if there is not already
    }

    if (economy[userId] < bet) {
        return await interaction.reply({
            content: "❌ You don't have enough money to play Blackjack! Let's work to earn more money.",
            flags: MessageFlags.Ephemeral,
        });
    }

    economy[userId] -= bet;
    saveEconomy(economy);

    let deck = createDeck();
    if (deck.length < 4) {
        return await interaction.reply({
            content: "❌ Not enough cards in the deck! Try again later.",
            flags: MessageFlags.Ephemeral,
        });
    }

    const playerHand = [deck.pop(), deck.pop()];
    const botHand = [deck.pop(), deck.pop()];
    games.set(userId, { deck, playerHand, botHand, bet });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("blackjack_hit")
            .setLabel("Hit")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("blackjack_stand")
            .setLabel("Stand")
            .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({
        embeds: [
            {
                title: "🎰 Blackjack!",
                description: `💳 **Your hand:** ${playerHand.map((c) => cardEmojis[c]).join(" ")}\n
                    🃏 **Bot's hand:** ${cardEmojis[botHand[0]]} ❓\n
                    💰 **Bet:** ${bet} <:parallel_coin:1350066344632123462>`,
                color: 0x0099ff,
            },
        ],
        components: [row],
        flags: MessageFlags.Ephemeral
    });
};

const handleBlackjackButton = async (interaction) => {
    if (!interaction.customId.startsWith("blackjack_")) return;
    const userId = interaction.user.id;

    if (!games.has(userId)) {
        return await interaction.reply({
            content: "❌ You haven't started the game yet! Use `/blackjack` to start.",
            flags: MessageFlags.Ephemeral,
        });
    }
    const game = games.get(userId);

    if (interaction.customId === "blackjack_hit") {
        if (game.deck.length === 0) {
            return await interaction.reply({
                content: "❌ There are no more cards in the deck!",
                flags: MessageFlags.Ephemeral,
            });
        }

        game.playerHand.push(game.deck.pop());
        const playerPoints = calculatePoints(game.playerHand);

        if (playerPoints > 21) {
            games.delete(userId);
            return await interaction.update({
                embeds: [
                    {
                        title: "💥 You have been busted (Bust)!",
                        description: `💳 **Your hand:** ${game.playerHand.map((c) => cardEmojis[c]).join(" ")} (**${playerPoints} point**)`,
                        color: 0xff0000,
                        footer: {
                            icon_url: "https://cdn.discordapp.com/emojis/1350066344632123462.png",
                            text: `-${game.bet}`,
                        },
                    },
                ],
                components: [],
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.update({
            embeds: [
                {
                    title: "🎰 Blackjack!",
                    description: `💳 **Your hand:** ${game.playerHand.map((c) => cardEmojis[c]).join(" ")} (**${playerPoints} point**)\n
                        🃏 **Bot's hand:** ${cardEmojis[game.botHand[0]]} ❓`,
                    color: 0x0099ff,
                },
            ],
            components: interaction.message.components,
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.customId === "blackjack_stand") {
        let botPoints = calculatePoints(game.botHand);
        while (botPoints < 17 && game.deck.length > 0) {
            game.botHand.push(game.deck.pop());
            botPoints = calculatePoints(game.botHand);
        }

        const playerPoints = calculatePoints(game.playerHand);
        let result;
        let winnings = 0;

        if (botPoints > 21 || playerPoints > botPoints) {
            result = `🎉 You win! +${game.bet * 2}`;
            winnings = game.bet * 2;
        } else if (botPoints > playerPoints) {
            result = "😢 You lose!";
            winnings = 0;
        } else {
            result = "⚖ Draw! You get the bet back.";
            winnings = game.bet;
        }

        economy[userId] = (economy[userId] || 0) + winnings;
        saveEconomy(economy);
        games.delete(userId);

        const embedColor =
            botPoints > 21 || playerPoints > botPoints
                ? 0x00ff00
                : botPoints > playerPoints
                  ? 0xff0000
                  : 0xffff00;

        await interaction.update({
            embeds: [
                {
                    title:
                        botPoints > 21 || playerPoints > botPoints
                            ? "🎉 You win!"
                            : botPoints > playerPoints
                              ? "😢 You lose!"
                              : "⚖ Draw!",
                    description:
                        `💳 **Your hand:** ${game.playerHand.map((c) => cardEmojis[c]).join(" ")} (**${playerPoints} point**)\n` +
                        `🃏 **Bot's hand:** ${game.botHand.map((c) => cardEmojis[c]).join(" ")} (**${botPoints} point**)`,
                    color: embedColor,
                    footer: {
                        icon_url: "https://cdn.discordapp.com/emojis/1350066344632123462.png",
                        text: winnings > 0 ? `+${winnings}` : winnings === 0 ? "±0" : `-${game.bet}`,
                    },
                },
            ],
            components: [],
            flags: MessageFlags.Ephemeral,
        });
    }
};
module.exports = { handleBlackjack, handleBlackjackButton };