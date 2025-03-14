const handleHello = async (interaction) => {
    return interaction.reply(
        `Xin chào! 👋`,
    );
}

/*
const handleHello = async (interaction) => {
    const targetUser = interaction.options.getUser("user");

    if (!targetUser) {
        return interaction.reply({
            content: "⚠️ Vui lòng chỉ định một người dùng hợp lệ!",
            ephemeral: true,
        });
    }

    return interaction.reply(
        `Gửi lời chào tới <@${targetUser.id}>! 👋`,
    );
}
*/

module.exports = {
    execute: handleHello
};