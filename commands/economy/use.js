exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, banker, embedder, messenger } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  

  if(!args[0]) {
    message.channel.send("specify an item id")
    return
  }
  const item = args[0].toLowerCase()
  
  const msg = await messenger.loadingMessage(message.channel, { colour: settings.colours.generic })


  const inventory = await banker.getInventory(message.author.id)
  if(!inventory[item])
    return msg.edit("you do not have this item", { embed: null })
  if(!itemConfig[item])
    return msg.edit("unknown item specified", { embed: null })
  if(!itemConfig[item].use)
    return msg.edit("item cannot be used", { embed: null })
    
  const res = await itemConfig[item].use(message.author.id)
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Used Item \`${item}\``)
    .setDescription(res ?? "No more information was provided.")
  embedder.addAuthor(emb, message.author)

  msg.edit(emb)
}

exports.cooldown = 5