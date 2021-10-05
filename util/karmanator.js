const index = require("../index.js")
const {
  client,
  config,
  Discord,
  firebaseAdmin,
  db,
  karmaQueue,
  newKarmaCache
} = index
const { badger } = client.util

exports.get = async (userId) => {
  let karma = 0
  if(newKarmaCache[userId]) {
    karma = newKarmaCache[userId]
  }
  else {
    const userRef = db.collection("users").doc(userId)
    const doc = await userRef.get()
  
    if(doc.exists) {
      let data = doc.data()
  
      if(data.karma) {
        karma = data.karma
      }
    }
    newKarmaCache[userId] = karma
  }

  karma += karmaQueue[userId] ?? 0
  return karma
}

exports.getTop = async (count) => {
  const usersColl = db.collection("users")
  
  const snapshot = await usersColl
    .orderBy("karma", "desc")
    .limit(count + 1)
    .get()

  let topKarmas = []
  snapshot.forEach(async doc => {
    const data = doc.data()
    let karma = data.karma

    topKarmas.push({
      user: `<@${doc.id}>`,
      id: doc.id,
      karma: karma,
    })
  })

  return topKarmas
}

exports.add = async (userId, amount, options) => {
  const { logger } = client.util

  if(!karmaQueue[userId])
    karmaQueue[userId] = amount
  else
    karmaQueue[userId] += amount
  
  let logMessage = `Queued ${amount} karma for U ${userId}`

  if(options) {
    if(options.reason)
      logMessage += ` for \`${options.reason}\``
    if(options.voterId)
      logMessage += ` by V ${options.voterId}`
    if(options.messageId)
      logMessage += ` on M ${options.messageId}`
  }
  
  logger.log(logMessage, "addKarma")

  let currentKarma = await this.get(userId)
  if(currentKarma >= 100) await badger.awardBadge(userId, "karma_100", false, "acquiring 100 karma points")
  if(currentKarma >= 1000) await badger.awardBadge(userId, "kilokarma", false, "acquiring 1000 karma points")
  if(currentKarma >= 2000) await badger.awardBadge(userId, "karma_2k", false, "acquiring 2000 karma points")
  if(currentKarma >= 3000) await badger.awardBadge(userId, "karma_3k", false, "acquiring 3000 karma points")
}

exports.update = async () => {
  const { logger } = client.util

  if(Object.keys(karmaQueue).length === 0)
    return
  
  logger.log(`Updating karma...`, "updateKarma")
  logger.log(JSON.stringify(karmaQueue, null, 4))

  let dbChanges = false
  let totalKarmaChanges = Object.values(karmaQueue).reduce((acc, curr) => acc + curr)

  const batch = db.batch()
  for(let i in karmaQueue) {
    if(!karmaQueue[i]) {
      delete karmaQueue[i]
      continue // don't bother database if net change is zero
    }

    const increment = firebaseAdmin.firestore.FieldValue.increment(karmaQueue[i]) // increment by net change
    const docRef = db.collection("users").doc(i)

    let payload = { karma: increment }
    const user = client.users.cache.find(u => u.id === i) // caches the user's tag for leaderboard or somehting
    if(user) {
      payload.tag = user.tag
      payload.avatar = user.avatarURL({ dynamic: true })
    }

  
    batch.set(docRef, payload, { merge: true })

    delete karmaQueue[i]
    dbChanges = true
  }
  await batch.commit()



  // if(dbChanges) {
  //   karmaCache.splice(0, karmaCache.length)
  //   if(totalKarmaChanges) {
  //     const dateStr = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  //     const increment = firebaseAdmin.firestore.FieldValue.increment(totalKarmaChanges)

  //     const docRef = db
  //       .collection("stats")
  //       .doc("karma_votes")
  //       .collection("dates")
  //       .doc(dateStr)
  //     const payload = {
  //       total: increment,
  //       timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp()
  //     }

  //     await docRef.set(payload, { merge: true })
  //   }
  // }
}

exports.countVote = async (reaction, user, removed) => {
  const { logger } = client.util
  const settings = config.karma

  let message = reaction.message

  if(
    (message.guild && message.guild.id !== config.main.guild.id) ||
    (user && message.author && (user.bot || user.id === message.author.id)) || // reactions of bots and reactions of the message author do not count
    (message.webhookID || message.author.system) // webhook and system message authors cannot be added
  ) {
    return
  }

  let emoji = reaction.emoji.name
  if(reaction.emoji instanceof Discord.GuildEmoji) {
    emoji = reaction.emoji.id
  }

  for(let i in settings.emojis) {
    if(settings.emojis[i].id === emoji) {
      if(settings.emojis[i].karma) {
        this.add(message.author.id, removed ? -settings.emojis[i].karma : settings.emojis[i].karma, {
          reason: `${removed ? "remove" : "add"} ${i}`,
          voterId: user.id,
          messageId: message.id
        })
      }
      else {
        logger.log(`Karma vote reactions error: emoji ${i} does not have karma value!`)
      }
    }
  }
}