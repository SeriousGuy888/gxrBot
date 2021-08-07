module.exports = async (client, interaction) => {
  if(interaction.isCommand()) { // https://discord.js.org/#/docs/main/stable/class/CommandInteraction
    const scommand = client.scommands.get(interaction.commandName)
    if(!scommand) {
      interaction.reply({
        content: "This slash command does not exist. D:",
        ephemeral: true
      })
      return
    }
    
    try {
      const scommand = client.scommands.get(interaction.commandName)
      if(scommand.defer) await interaction.deferReply()
      await scommand.execute(interaction, interaction.options.data)
    } catch(err) {
      console.error(err)
      await interaction.reply({
        content: "Error while executing this command.",
        ephemeral: true
      })
    }
  }
}