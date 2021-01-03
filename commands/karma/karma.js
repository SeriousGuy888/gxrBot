exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, db, karmaQueue, karmaCache, messenger } = index

  const settings = config.karma


  let member
  if(!args[0])
    member = message.author
  else
    member = message.mentions.members.first() || await message.guild.members.fetch(args[0])
  if(member.user)
    member = member.user
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.karma,
    title: `Querying Karma of ${member.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setThumbnail(member.avatarURL({ dynamic: true }))
    .setTitle(`${member.tag}'s Karma`)
    .setURL(`${settings.lang.web_panel.user_lookup}?ids=${member.id}`)
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
  
  responseEmbed.setDescription(notFound ? "No Database Entry" : `:sparkles: ${karma.toLocaleString()}`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10