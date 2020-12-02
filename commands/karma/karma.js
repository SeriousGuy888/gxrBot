exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, db, timeConvert, karmaQueue, commandCooldowns } = index

  let cooldown = 15 * 1000 // ms
  if(commandCooldowns.karma[message.author.id]) {
    let cooldownRemaining = new Date() - commandCooldowns.karma[message.author.id]
    if(cooldownRemaining < cooldown) {
      let cooldownRemainingHuman = await timeConvert(cooldownRemaining)
      message.channel.send(`Please stop killing my database.\nYou need to wait another \`${cooldown / 1000 - cooldownRemainingHuman.s} seconds\` before sending another query.`)
      return
    }
  }

  commandCooldowns.karma[message.author.id] = new Date()


  
  let member = message.mentions.members.first().user// || message.guild.members.cache.get(args[0]).user
  if(!member)
    member = message.author

  const responseEmbed = new Discord.MessageEmbed()
    .setColor("#d223d2")
    .setTitle(`Karma of ${member.tag}`)
    .setFooter("Pending karma is sent to database every few minutes.")

  const userRef = db.collection("users").doc(member.id)
  const doc = await userRef.get()

  if(!doc.exists)
    responseEmbed.setDescription("No Database Entry")
  else {
    let karma = doc.data().karma
    if(karmaQueue[doc.id])
      karma = `${karma} plus ${karmaQueue[doc.id]} pending`
    
    responseEmbed.setDescription(`:sparkles: ${karma}`)
  }

  message.channel.send(responseEmbed)
}