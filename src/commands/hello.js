const handleHello = async (interaction) => {
    return interaction.reply(
        `Hello! 👋`,
    );
}

/*
const handleHello = async (interaction) => {
    const targetUser = interaction.options.getUser("user");

    if (!targetUser) {
        return interaction.reply({
            content: "⚠️ Please specify a valid user!",
            ephemeral: true,
        });
    }

    return interaction.reply(
        `Send greetings to <@${targetUser.id}>! 👋`,
    );
}
*/

module.exports = {
    execute: handleHello
};