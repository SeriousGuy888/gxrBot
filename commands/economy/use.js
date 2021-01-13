exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, banker, embedder, messenger } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  

  if(!args[0])
    return messenger.errorMessage(msg, { description: "Please specify an item ID." })
  const item = args[0].toLowerCase()
  
  const msg = await messenger.loadingMessage(message.channel, { colour: settings.colours.generic })


  if(!itemConfig[item])
    return messenger.errorMessage(msg, { description: "This item is unknown." })
  if(!itemConfig[item].use)
    return messenger.errorMessage(msg, { description: "This item cannot be used." })
  
  const inventory = await banker.getInventory(message.author.id)
  if(!inventory[item])
    return messenger.errorMessage(msg, { description: "You do not have this item." })
    
  const res = await itemConfig[item].use(message.author.id)
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Used Item \`${item}\``)
    .setDescription(res ?? "No more information was provided.")
  embedder.addAuthor(emb, message.author)

  msg.edit(emb)
}

exports.cooldown = 5