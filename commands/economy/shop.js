exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, embedder } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  
  const { coin } = settings.lang.emojis

  const { itemsPerPage } = settings.shop
  const itemKeys = Object.keys(itemConfig).sort()
  const maxPages = Math.ceil(itemKeys.length / itemsPerPage)

  let page = Math.min(Math.abs(args[0]) || 1, maxPages)
  

  let msg = await message.channel.send("Shop Panel")

  const displayShop = async (editMsg) => {
    page = Math.max(Math.min(page, maxPages), 1)

    const responseEmbed = new Discord.MessageEmbed()
      .setColor(settings.colours.generic)
      .setTitle("Item Shop")
      .setDescription("You can use the `buy` and `sell` commands.")
      .setFooter(`Page ${page} of ${maxPages}`)
    embedder.addAuthor(responseEmbed, message.author, "%tag%'s Shop Panel")
  
    for(let i = 0; i < itemsPerPage; i++) {
      const itemIndex = i + ((page - 1) * itemsPerPage)
      const itemKey = itemKeys[itemIndex]
  
      if(!itemKey)
        break
  
      const itemInfo = itemConfig[itemKey]
  
      const itemEmoji = itemInfo.emoji + " " ?? ""
      const itemName = itemInfo.name ? itemEmoji + itemInfo.name : itemKey
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
        false
      )
      embedder.addBlankField(responseEmbed)
    }
  
    
    return await editMsg.edit(responseEmbed)
      .then(async editedMsg => {
        const reactionEmojis = ["⏪", "◀️", "▶️", "⏩"]
        const reactionFilter = (reaction, user) => user.id == message.author.id && reactionEmojis.includes(reaction.emoji.name)

        editedMsg.awaitReactions(reactionFilter, { max: 1, time: settings.shop.expireTimeout })
          .then(async collected => {
            const emojiName = collected.first().emoji.name
            editedMsg.reactions.resolve(emojiName).users.remove(message.author).catch(() => {}) // remove user's reaction
            switch(emojiName) {
              case "⏪":
                page = 1
                break
              case "◀️":
                page--
                break
              case "▶️":
                page++
                break
              case "⏩":
                page = maxPages
                break
            }
            editedMsg.edit(await displayShop(editedMsg))
          })
          .catch(() => {
            editedMsg.edit("This shop panel is no longer listening for reactions.\nPlease use the `shop` command again to change pages.", {
              embed: responseEmbed.setColor(settings.colours.failure)
            })
          })
        
        for(const loopEmoji of reactionEmojis)
          await editedMsg.react(loopEmoji)
      })
  }

  msg = await displayShop(msg)
}