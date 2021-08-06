exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, embedder } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  

  if(!args[0]) {
    message.channel.send("specify an item id")
    return
  }

  const item = args[0].toLowerCase()
  const itemInfo = itemConfig[item] ?? { unknown: true }
  
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`About Item \`${item}\``)
  embedder.addAuthor(emb, message.author)

  if(itemInfo.unknown) {
    emb.setDescription("This item is unknown.")
  }
  else {
    const { coin } = settings.lang.emojis
    emb
      .addField("Item Name", `${itemInfo.emoji + " " ?? ""}${itemInfo.name ?? item}`)
      .addField("Description", itemInfo.description)
    
    let { value } = itemInfo
    if(!value)
      value = {}
    emb
      .addField("Buy Price", value.buy ? `${coin}${value.buy.toLocaleString()}` : "Cannot be purchased.", true)
      .addField("Sell Price", value.sell ? `${coin}${value.sell.toLocaleString()}` : "Cannot be sold.", true)
    
    emb.addField("Other", [
      itemInfo.use ? "Can be used" : "Cannot be used",
      itemInfo.givable ? "Can be given to another user" : "Cannot be given to another user"
    ].join("\n"))
  }


  message.channel.send(emb)
}

exports.cooldown = 5

exports.disabled = "temp disabled during discord.js v13 update"