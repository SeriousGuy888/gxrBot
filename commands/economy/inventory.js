exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, getUserArg, banker, messenger } = index
  const settings = config.economy
  

  let page = 1
  if(args[1])
    page = parseInt(args[1])
  if(args[0])
    page = parseInt(args[0])


  let user = await getUserArg(message)
  
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Querying Inventory of ${user.tag}`
  })


  const inventory = await banker.getInventory(user.id)
  const inventoryKeys = Object.keys(inventory).sort()
  const sortedInventory = {}

  const itemsPerPage = settings.inventory.itemsPerPage
  const pageCount = Math.ceil(inventoryKeys.length / itemsPerPage)
  let itemsLooped = 0
  let itemNumber = itemsPerPage * (page - 1)
  let itemsAdded = 0

  for(const loopKey of inventoryKeys)
    sortedInventory[loopKey] = inventory[loopKey]

  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Inventory of ${user.tag}`)
    .setFooter(`Page ${page} of ${pageCount}`)
  

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
        responseEmbed.addField(`\`${sortedInventory[item]}\` ${item}`, "description", true)
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