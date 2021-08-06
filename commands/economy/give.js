exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, getUserArg, banker, embedder, messenger } = index
  const settings = config.economy.settings
  const itemConfig = config.economy.items
  
  
  if(!args[1]) {
    this.help(client, message, args)
    return
  }


  const user = await getUserArg(message)
  const item = args[1].toLowerCase()
  const amount = parseInt(args[2]) || 1
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: "Giving item..."
  })


  if(user.id === message.author.id)
    return msg.edit("Specify a valid user who is not yourself.", { embed: null })
  if(amount < 1)
    return msg.edit("Give at least 1 of the item.", { embed: null })

  const inventory = await banker.getInventory(message.author.id)
  if(!inventory[item] || inventory[item] < amount) // not enough items
    return msg.edit("you do not have this item", { embed: null })
  if(!itemConfig[item])
    return msg.edit("unknown item specified", { embed: null })
  if(!itemConfig[item].givable)
    return msg.edit("the item you specified is not allowed to be given to another user", { embed: null })
  
  
  banker.addToInventory(message.author.id, item, -amount)
  banker.addToInventory(user.id, item, amount)
  
  const emb = embedder.newEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Item Sent`)
    .setDescription(`${message.author} gave \`${amount}\` of the item \`${item}\` to ${user}.`)
  embedder.addAuthor(emb, message.author)

  msg.edit(emb)
}

exports.help = async (client, message, args) => {
  message.channel.send("aaaa")
}

exports.cooldown = 12

exports.disabled = "temp disabled during discord.js v13 update"