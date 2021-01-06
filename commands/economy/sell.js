exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, banker, embedder, messenger } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  const { loadingMessage, errorMessage } = messenger
  
  
  if(!args[0]) {
    this.help(client, message, args)
    return
  }


  const item = args[0]
  const amount = parseInt(args[1]) || 1
  
  const msg = await loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: "Selling item..."
  })

  const itemInfo = itemConfig[item]
  if(!itemInfo)
    return errorMessage(msg, { description: "Item unknown" })
  if(!itemInfo.value || !itemInfo.value.sell)
    return errorMessage(msg, { description: "Item cannot be sold" })

  if(amount < 1)
    return errorMessage(msg, { description: "Sell at least 1 of the item." })


  const price = itemInfo.value.sell * amount
  const inventory = await banker.getInventory(message.author.id)

  if(!inventory[item])
    return errorMessage(msg, { description: "You do not have this item." })
  if(inventory[item] < amount)
    return errorMessage(msg, { description: `You only have \`${inventory[item]}\` of \`${item}\`.` })
  

  
  banker.addToInventory(message.author.id, item, -amount)
  banker.addToBalance(message.author.id, price)
  
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Item Sold`)
    .setDescription(`Sold \`${amount.toLocaleString()}\` of the item \`${item}\` for ${settings.lang.emojis.coin}${price.toLocaleString()}.`)
  embedder.addAuthor(emb, message.author)


  msg.edit(emb)
}

exports.help = async (client, message, args) => {
  message.channel.send("aaaa")
}

exports.cooldown = 12