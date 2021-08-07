module.exports = async (client, interaction) => {
  const index = require("../index.js")
  const { Discord, config } = index
  const { timer } = client.util

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
      
      if(scommand.cooldown) {
        const cooldown = scommand.cooldown * 1000
        if(!client.commandCooldowns[`/${scommand.name}`]) client.commandCooldowns[`/${scommand.name}`] = {}
        
        if(client.commandCooldowns[`/${scommand.name}`][interaction.user.id]) {
          const timeSinceLastUse = Date.now() - client.commandCooldowns[`/${scommand.name}`][interaction.user.id]

          if(timeSinceLastUse < cooldown) {
            const timeString = await timer.stringify(cooldown - timeSinceLastUse, { truncZero: true, dropMs: true })

            const emb = new Discord.MessageEmbed()
              .setColor(config.main.colours.error)
              .setTitle(`Slash Command \`/${scommand.name}\` is on cooldown.`)
              .setDescription(`You must wait \`${timeString}\` before using this command again.`)
            interaction.reply({
              embeds: [emb],
              ephemeral: true
            })

            return
          }
        }

        client.commandCooldowns[`/${scommand.name}`][interaction.user.id] = new Date()
      }

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