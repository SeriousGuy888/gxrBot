exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!args[0])
    return this.help(client, message, args)

  if(!config.admins.ids[message.author.id]) {
    message.reply("no permission")
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