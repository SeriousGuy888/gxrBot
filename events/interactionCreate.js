module.exports = async (client, interaction) => {
  if(!interaction.isCommand()) return
  if(!client.scommands.has(interaction.commandName)) return
  
  try {
    await client.scommands
      .get(interaction.commandName)
      .execute(interaction)
  } catch(err) {
    console.error(err)
    await interaction.reply({
      content: "Error while executing this command.",
      ephemeral: true
    })
  }
}