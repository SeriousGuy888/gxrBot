exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, getUserArg, banker, embedder } = index
  const settings = config.economy.settings
  
  

  if(config.admins.superadmin.id !== message.author.id) {
    message.reply("no permission")
    return
  }

  if(!args[0])
    return message.channel.send("aaaaaaaaaaaaaa")

  let user
  if(args[0].toLowerCase() === "guild") {
    if(!message.guild)
      return message.channel.send("D: no guild")
    user = args[0].toLowerCase()
  }
  else
    user = await getUserArg(message)

  const item = args[1].toLowerCase()
  const amount = parseInt(args[2]) || 1
  
  let users = []
  if(user === "guild") {
    users = (await message.guild.members.fetch()).map(u => u)
  }
  else
    users.push(user)

  for(const loopUser of users) {
    if(loopUser.bot)
      continue
    banker.addToInventory(loopUser.id, item, amount)
  }

  message.channel.send(`ok gave ${amount} of ${item} to ${users.length} users`)
}

exports.cooldown = 3