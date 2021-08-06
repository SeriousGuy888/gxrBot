module.exports = async (client, interaction) => {
  if(interaction.isCommand()) { // https://discord.js.org/#/docs/main/stable/class/CommandInteraction
    interaction.deferReply()

    const scommand = client.scommands.get(interaction.commandName)
    if(!scommand) {
      interaction.followUp({ content: "This slash command does not exist. D:" })
      return
    }
    
    try {
      await client.scommands
        .get(interaction.commandName)
        .execute(interaction, interaction.options.data)
    } catch(err) {
      console.error(err)
      await interaction.reply({
        content: "Error while executing this command.",
        ephemeral: true
      })
    }
  }
}