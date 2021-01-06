exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, banker, embedder, messenger } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  
  
  if(!args[0]) {
    this.help(client, message, args)
    return
  }


  const item = args[0]
  const amount = parseInt(args[1]) || 1
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: "Buying item..."
  })

  const itemInfo = itemConfig[item]
  if(!itemInfo)
    return msg.edit("Item unknown", { embed: null })
  if(!itemInfo.value || !itemInfo.value.buy)
    return msg.edit("Item cannot be purchased", { embed: null })

  if(amount < 1)
    return msg.edit("Purchase at least 1 of the item.", { embed: null })


  const price = itemInfo.value.buy * amount
  const balance = await banker.getBalance(message.author.id)

  if(balance < price)
    return msg.edit(`You only have ${balance} moolahs`, { embed: null })
  

  
  banker.addToBalance(message.author.id, -price)
  banker.addToInventory(message.author.id, item, amount)
  
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Item Purchased`)
    .setDescription(`Purchased \`${amount}\` of the item \`${item}\` for ${settings.lang.emojis.coin}${price}.`)
  embedder.addAuthor(emb, message.author)


  msg.edit(emb)
}

exports.help = async (client, message, args) => {
  message.channel.send("aaaa")
}

exports.cooldown = 12