exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { messenger, embedder, preferencer } = client.util

  const prefEmbed = async () => {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setDescription("Use `-settings <setting> <value>` to change a setting.")
    embedder.addAuthor(emb, message.author, "%tag%'s Preferences")

    const preferences = await preferencer.get(message.author.id)
    for(const i in preferences) {
      emb.addField(i.toUpperCase(), preferences[i] ? "Yes" : "No", true)
    }

    return emb
  }


  if(!args[0]) {
    const msg = await messenger.loadingMessage(message.channel, {
      colour: config.main.colours.help,
      title: `Getting ${message.author.tag}'s settings...`
    })

    const emb = await prefEmbed()

    msg.edit(emb)
    return
  }

  const prefName = args[0]?.toLowerCase()
  let prefValue = args[1] ?? ""

  switch(prefValue.toLowerCase().charAt(0)) {
    case "y":
    case "t":
      prefValue = true
      break
    case "n":
    case "f":
      prefValue = false
      break
    default:
      prefValue = null
      break
  }

  if(!preferencer.isValid(prefName)) {
    message.channel.send("Invalid preference name!")
    return
  }
  if(prefValue === null) {
    message.channel.send("Invalid value! Specify `Y` or `N`")
    return
  }

  await preferencer.set(message.author.id, prefName, prefValue)
  const responseEmbed = await prefEmbed()
  message.channel.send(responseEmbed)
}