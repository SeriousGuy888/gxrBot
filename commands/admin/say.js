exports.run = async (client, message, args) => {
  const { permisser } = client.util

  if(!args[0]) return this.help(client, message, args)

  const guild = message.guild
  if(guild) {
    if(!await permisser.permissionEmbed(message.member, ["ADMINISTRATOR", "MANAGE_MESSAGES"], false, message.channel)) {
      return
    }
  }

  await message.channel.send({ content: args.join(" ") })
  if(message.deletable) message.delete()
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { prefix } = index
  const { commandHelpEmbed } = client.functions

  const embed = commandHelpEmbed(message, {
    title: "**Say Command**",
    description: "Make g9lBot say something! (You must be listed as an admin to use this.)",
    syntax: `${prefix}say <something>`,
    example: [
      `**say hi**`,
      ` ${prefix}say hi`,
    ].join("\n"),
  })
  
  message.channel.send({ embeds: embed })
}