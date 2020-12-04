exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, db, timeConvert, karmaQueue, commandCooldowns } = index
  let { karmaCache } = index

  const settings = config.karma

  // let cooldown = 15 * 1000 // ms
  // if(commandCooldowns.karma[message.author.id]) {
  //   let cooldownRemaining = new Date() - commandCooldowns.karma[message.author.id]
  //   if(cooldownRemaining < cooldown) {
  //     let cooldownRemainingHuman = await timeConvert(cooldownRemaining)
  //     message.channel.send(`Please stop killing my database.\nYou need to wait another \`${cooldown / 1000 - cooldownRemainingHuman.s} seconds\` before sending another query.`)
  //     return
  //   }
  // }

  // commandCooldowns.karma[message.author.id] = new Date()


  
  let member
  if(message.mentions.members.first())
    member = message.mentions.members.first().user// || message.guild.members.cache.get(args[0]).user
  if(!member)
    member = message.author

  const responseEmbed = new Discord.MessageEmbed()
    .setColor("#d223d2")
    .setTitle(`Karma of ${member.tag}`)
    .setFooter("Pending karma is sent to database every few minutes.")

  let memberCacheIndex
  for(let i in karmaCache) {
    if(karmaCache[i].id === member.id) {
      memberCacheIndex = i
      break
    }
  }

  let karma
  let notFound

  if(memberCacheIndex)
    karma = karmaCache[memberCacheIndex].karma
  else {
    const userRef = db.collection("users").doc(member.id)
    const doc = await userRef.get()
  
    if(!doc.exists)
      notFound = true
    else {
      let data = doc.data()

      karma = data.karma

      karmaCache.push({
        user: member.tag,
        id: doc.id,
        karma: karma,
      })
    }
  }

  if(karmaQueue[member.id])
    karma = `${karma} and ${karmaQueue[member.id]} pending`
  
  responseEmbed.setDescription(notFound ? "No Database Entry" : `:sparkles: ${karma.toLocaleString()}`)

  message.channel.send(responseEmbed)
}