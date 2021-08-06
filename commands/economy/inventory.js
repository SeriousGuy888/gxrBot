exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, inventoryQueue, getUserArg, banker, embedder, messenger } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  

  let page = 1
  if(args[0])
    page = parseInt(args[0])
  if(args[1])
    page = parseInt(args[1])


  let user = await getUserArg(message)
  
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Querying Inventory of ${user.tag}`
  })


  const inventory = await banker.getInventory(user.id)

  for(const i in inventoryQueue[message.author.id]) {
    if(!inventory[i])
      inventory[i] = 0
    inventory[i] += inventoryQueue[message.author.id][i]
  }

  const inventoryKeys = Object.keys(inventory).sort()
  const sortedInventory = {}

  for(const loopKey of inventoryKeys)
    sortedInventory[loopKey] = inventory[loopKey]

  const itemsPerPage = settings.inventory.itemsPerPage
  const pageCount = Math.ceil(inventoryKeys.length / itemsPerPage)

  if(page > pageCount)
    page = 1

  let itemsLooped = 0
  let itemNumber = itemsPerPage * (page - 1)
  let itemsAdded = 0

  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setFooter(`Page ${page} of ${pageCount}`)
  embedder.addAuthor(responseEmbed, user, "%tag%'s Inventory")
  

  if(inventoryKeys.length) {
    if(page > pageCount) {
      responseEmbed.setDescription("This page of this user's inventory is empty.")
    }
    else {
      for(const item in sortedInventory) {
        itemsLooped++
        if(itemsLooped < itemNumber + 1)
          continue
        if(itemsAdded >= itemsPerPage)
          break

        const itemInfo = itemConfig[item]
        if(itemInfo) {
          responseEmbed.addField(
            `${itemInfo.emoji + " " ?? ""}${itemInfo.name ?? item} \`(${sortedInventory[item]})\``,
            (itemInfo.name ? `ID: \`${item}\`\n\n` : "") + (itemInfo.description ?? "No description provided."),
            true
          )
        }
        else {
          responseEmbed.addField(`${item} \`(${sortedInventory[item]})\``, "Unknown Item", true)
        }
        itemNumber++
        itemsAdded++
      }
    }
  }
  else {
    responseEmbed.setDescription("This user does not have anything in their inventory.")
  }

  msg.edit(responseEmbed)
}

exports.cooldown = 10

exports.disabled = "temp disabled during discord.js v13 update"