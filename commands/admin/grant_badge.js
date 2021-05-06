exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const { badger, commander } = client.util
  

  if(!config.admins.ids[message.author.id]) {
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
    user = await commander.getMentionArgs(args[0], 0, message)

  if(!args[1])
    return message.channel.send("specify badge idot")

  const badge = args[1].toLowerCase()
  const remove = !!args[2]
  
  if(user === "guild") {
    const users = (await message.guild.members.fetch()).map(u => u)

    let inc = 0
    for(const loopUser of users) {
      if(loopUser.bot || loopUser.user.bot)
        continue
      badger.addBadge(loopUser.id, badge, remove)
      inc++
    }

    message.channel.send(`ok ${remove ? "removed" : "gave"} ${badge} to ${inc} non-bot users`)
  }
  else {
    badger.awardBadge(user.id, badge, remove, `manually awarded by ${message.author.tag}`)
    message.channel.send(`ok ${remove ? "removed" : "gave"} ${badge} to ${user}`)
  }
}

exports.cooldown = 3