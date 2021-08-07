module.exports = async (client, interaction) => {
  const index = require("../index.js")
  const { Discord, config } = index
  const { guildPreferencer, permisser, timer } = client.util

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
      if(interaction.inGuild()) {
        const prefs = await guildPreferencer.get(interaction.guild.id)
        const adminBypass = prefs.admins_bypass_disabled_commands

        if(prefs.disabled_commands) {
          const disabledCommands = prefs.disabled_commands
            .split(",")
            .map(e => e.trim().toLowerCase())
          
          if(disabledCommands.includes(scommand.name)) { // command is disabled
            if(
              !permisser.hasPermission(interaction.member, ["ADMINISTRATOR", "MANAGE_GUILD"]) || // member is not admin or
              !adminBypass // admins cannot bypass disabled commands
            ) {
              const emb = new Discord.MessageEmbed()
                .setColor(config.main.colours.error)
                .setTitle(`Slash Command \`/${scommand.name}\` is disabled in this server.`)
                .setDescription(`Ask an admin to reenable this command if you want to use it. ${adminBypass ? "Admins are allowed to bypass this." : ""}`)
              interaction.reply({ embeds: [emb] })
              return
            }
          }
        }
      }
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
      await scommand.execute(interaction, interaction.options)
    } catch(err) {
      console.error(err)
      await interaction.reply({
        content: "Error while executing this command.",
        ephemeral: true
      })
    }
  }
}