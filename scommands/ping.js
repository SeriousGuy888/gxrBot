module.exports = {
  name: "ping",
  description: "testing slash commands...",
  execute: async (interaction) => {
    await interaction.followUp("pong")
  }
}