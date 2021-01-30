exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { permisser } = client.util

  if(!args[0])
    return this.help(client, message, args)


  const guild = message.guild
  if(guild) {
    const authorMember = await guild.members.fetch(message.author)
    if(!await permisser.permissionEmbed(authorMember, ["ADMINISTRATOR", "MANAGE_MESSAGES"], false, message.channel))
      return
  }

  await message.channel.send(args.join(" "))

  if(message.deletable)
    message.delete()
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { commandHelpEmbed, prefix } = index

  const embed = commandHelpEmbed(message, {
    title: "**Say Command**",
    description: "Make g9lBot say something! (You must be listed as an admin to use this.)",
    syntax: `${prefix}say <something>`,
    example: [
      `**say hi**`,
      ` ${prefix}say hi`,
    ].join("\n"),
  })
  
  message.channel.send(embed)
}