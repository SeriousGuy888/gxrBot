exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const { badger, commander } = client.util
  

  if(!config.admins.ids[message.author.id]) {
    message.reply({ content: `You are not listed as a ${config.main.botNames.lowerCamelCase} admin!` })
    return
  }

  if(!args[0]) {
    message.reply({ content: "who the dukc do i bea giving the badge to? you dukcing idot" })
    return
  }

  let user
  if(args[0].toLowerCase() === "guild") {
    if(!message.guild) return message.reply({ content: "D: no guild" })
    user = args[0].toLowerCase()
  }
  else {
    user = await commander.getMentionArgs(args[0], 0, message)
  }

  if(!args[1]) {
    message.reply({ content: "what badge do you beas awarding? you dukcing idot" })
    return
  }

  const badge = args[1].toLowerCase()
  const remove = !!args[2]
  
  if(user === "guild") {
    const users = (await message.guild.members.fetch()).map(u => u)

    for(const loopUser of users) {
      if(loopUser.bot || loopUser.user.bot) continue
      badger.addBadge(loopUser.id, badge, remove)
    }

    message.reply({ content: `ok all unrobotic users in this guild have ${remove ? "lost" : "received"} the badge ${badge}` })
  }
  else {
    badger.awardBadge(user.id, badge, remove, `manually awarded by ${message.author.tag}`)
    message.reply({ content: `ok ${user} has ${remove ? "lost" : "received"} the badge ${badge}` })
  }
}

exports.cooldown = 3