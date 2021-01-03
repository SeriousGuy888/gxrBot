exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, db, getUserArg, karmaQueue, karmaCache, messenger } = index

  const settings = config.karma


  let user = await getUserArg(message)
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.karma,
    title: `Querying Karma of ${user.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setThumbnail(user.avatarURL({ dynamic: true }))
    .setTitle(`${user.tag}'s Karma`)
    .setURL(`${settings.lang.web_panel.user_lookup}?ids=${user.id}`)
    .setFooter(settings.lang.footer)

  let memberCacheIndex
  for(let i in karmaCache) {
    if(karmaCache[i].id === user.id) {
      memberCacheIndex = i
      break
    }
  }

  let karma
  let notFound

  if(memberCacheIndex)
    karma = karmaCache[memberCacheIndex].karma
  else {
    const userRef = db.collection("users").doc(user.id)
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

  if(karmaQueue[user.id])
    karma = `${karma} and ${karmaQueue[user.id]} pending`
  
  responseEmbed.setDescription(notFound ? "No Database Entry" : `:sparkles: ${karma.toLocaleString()}`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10