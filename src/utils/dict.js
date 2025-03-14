// Dice emojis for Dice
const diceStickers = {
    1: "<:dice_1:1350065971611828350>",
    2: "<:dice_2:1350066259458265159>",
    3: "<:dice_3:1350066271903027230>",
    4: "<:dice_4:1350066284628283433>",
    5: "<:dice_5:1350066296871452714>",
    6: "<:dice_6:1350066309970399252>",
};

// Card emojis for Blackjack
const cardEmojis = {
    A: "<:cardA_11:1282320280290590741>",
    K: "<:cardK_10:1282320261596577865>",
    Q: "<:cardQ_10:1282320247176564756>",
    J: "<:card10_10:1282320212020166799>",
    10: "<:card10_10:1282320212020166799>",
    9: "<:card9_9:1282320194819067994>",
    8: "<:card8_8:1282320178641895454>",
    7: "<:card7_7:1282320165102686277>",
    6: "<:card6_6:1282320150305181776>",
    5: "<:card5_5:1282320131103526912>",
    4: "<:card4_4:1282320113747623989>",
    3: "<:card3_3:1282320099851636888>",
    2: "<:card2_2:1282320083934511148>",
};

// Create a deck of cards
const createDeck = () => {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    return suits.flatMap(suit => values.map(value => value)).sort(() => Math.random() - 0.5);
};

// Calculate blackjack points
const calculatePoints = (hand) => {
    let points = 0, aceCount = 0;
    for (let card of hand) {
        if (["K", "Q", "J"].includes(card)) points += 10;
        else if (card === "A") { aceCount++; points += 11; }
        else points += parseInt(card);
    }
    while (points > 21 && aceCount > 0) { points -= 10; aceCount--; }
    return points;
};

module.exports = { diceStickers, cardEmojis, createDeck, calculatePoints };
