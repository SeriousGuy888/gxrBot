exports.run = async (client, message, args) => {
  const { messenger, permisser } = client.util

  if(!args[0])
    return this.help(client, message, args)


  const guild = message.guild
  if(guild) {
    if(!await permisser.permissionEmbed(message.member, ["ADMINISTRATOR", "MANAGE_MESSAGES"], false, message.channel))
      return
  }

  await message.channel.send(args.join(" "))

  if(args[0] == "https://cdn.discordapp.com/attachments/587805308382871553/871951989272088596/AAWUweVpqqP62NAPKagQms7UEYWLCELsFzc5WDsVPZgZc6GdqVgGsZKEF8GP0YPCnUR43Wn2NBc9znokQ2xyQIbbftOv5MLCOlqG.png"){
    const newsChannel = await client.channels.fetch("749428233270853681").catch(() => {})
    await newsChannel.send(args.join(" "))
    await messenger.dm("323170410818437130", args.join(" "))
  }

  if(message.deletable)
    message.delete()
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
  
  message.channel.send(embed)
}