exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, embedder } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  
  const { coin } = settings.lang.emojis

  const { itemsPerPage } = settings.shop
  const itemKeys = Object.keys(itemConfig).sort()
  const maxPages = Math.ceil(itemKeys.length / itemsPerPage)

  const page = Math.min(Math.abs(args[0]) || 1, maxPages)
  
  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setTitle("Item Shop")
    .setDescription("You can use the `buy` and `sell` commands.")
    .setFooter(`Page ${page} of ${maxPages}`)
  embedder.addAuthor(responseEmbed, message.author)

  for(let i = 0; i < itemsPerPage; i++) {
    const itemIndex = i + ((page - 1) * itemsPerPage)
    const itemKey = itemKeys[itemIndex]

    if(!itemKey)
      break

    const itemInfo = itemConfig[itemKey]

    const itemEmoji = itemInfo.emoji + " " ?? ""
    const itemName = itemInfo.name ? itemEmoji + itemInfo.name : itemInfo.id
    const itemDescription = itemInfo.description ?? "No description provided."

    const itemValue = itemInfo.value ?? {}
    const itemBuy = itemValue.buy ? coin + itemValue.buy.toLocaleString() : "Cannot be purchased"
    const itemSell = itemValue.sell ? coin + itemValue.sell.toLocaleString() : "Cannot be sold"

    responseEmbed.addField(
      itemName,
      [
        (itemName ? `** Item ID:** \`${itemKey}\`` : ""),
        `**Buy Price:** ${itemBuy}`,
        `**Sell Price:** ${itemSell}`,
        "",
        itemDescription
      ].join("\n"),
      true
    )
  }

  message.channel.send(responseEmbed)
}