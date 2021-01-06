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


  const item = args[0].toLowerCase()
  const amount = parseInt(args[1]) || 1
  
  const msg = await loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: "Buying item..."
  })

  const itemInfo = itemConfig[item]
  if(!itemInfo)
    return errorMessage(msg, { description: "Item unknown" })
  if(!itemInfo.value || !itemInfo.value.buy)
    return errorMessage(msg, { description: "Item cannot be purchased" })

  if(amount < 1)
    return errorMessage(msg, { description: "Purchase at least 1 of the item." })


  const price = itemInfo.value.buy * amount
  const balance = await banker.getBalance(message.author.id)

  if(balance < price)
    return errorMessage(msg, {
      description: `You only have ${settings.lang.emojis.coin}${balance.toLocaleString()}. ${settings.lang.emojis.coin}${price.toLocaleString()} are needed.`
    })
  

  
  banker.addToBalance(message.author.id, -price)
  banker.addToInventory(message.author.id, item, amount)
  
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Item Purchased`)
    .setDescription(`Purchased \`${amount.toLocaleString()}\` of the item \`${item}\` for ${settings.lang.emojis.coin}${price.toLocaleString()}.`)
  embedder.addAuthor(emb, message.author)


  msg.edit(emb)
}

exports.help = async (client, message, args) => {
  message.channel.send("aaaa")
}

exports.cooldown = 12