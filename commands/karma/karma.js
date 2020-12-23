exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, db, karmaQueue } = index
  let { karmaCache } = index

  const settings = config.karma


  if(!args[0])
    return message.channel.send("Specify a mention or a user id.")
  
  let member = message.mentions.members.first() || await message.guild.members.fetch(args[0])
  if(!member)
    return message.channel.send("Invalid user specified.")
  if(member.user)
    member = member.user
  

  const waitingEmb = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setTitle(`${config.main.emojis.loading} Querying Karma of ${member.tag}`)
    .setDescription("Please wait...")
  const msg = await message.channel.send(waitingEmb)


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setTitle(`Karma of ${member.tag}`)
    .setFooter(settings.lang.footer)

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

      // karmaCache.push({
      //   user: member.tag,
      //   id: doc.id,
      //   karma: karma,
      // })
    }
  }

  if(karmaQueue[member.id])
    karma = `${karma} and ${karmaQueue[member.id]} pending`
  
  responseEmbed.setDescription(notFound ? "No Database Entry" : `:sparkles: ${karma.toLocaleString()}\n[See this user on the web panel](${settings.lang.web_panel.user_lookup}?ids=${member.id} "See this user on the web panel.")`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10