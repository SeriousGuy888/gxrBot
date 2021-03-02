const index = require("../index.js")
const { client, firebaseAdmin, db } = index
const { increment } = firebaseAdmin.firestore.FieldValue
let { statCache, statQueue } = index

exports.get = async userId => {
  let stats = {}
  if(statCache[userId])
    stats = statCache[userId]
  else {
    const userRef = db.collection("users").doc(userId)
    const doc = await userRef.get()

    if(doc.exists) {
      let data = doc.data()
  
      if(data.stats) // if database record for user's stats exists
        stats = data.stats // read record and use as stats
    }
    
    statCache[userId] = stats
  }

  if(!statQueue[userId])
    statQueue[userId] = {}
  for(const stat in statQueue[userId]) {
    if(!stats[stat])
      stats[stat] = 0
    stats[stat] += statQueue[userId][stat]
  }
  for(const stat in stats) {
    if(!stats[stat]) // zero stat amount
      delete stats[stat] // pretend the stat doesnt exist
  }

  return stats
}

exports.add = async (userId, stat, amount) => {
  const { logger } = client.util
  if(!amount)
    amount = 1

  if(!statQueue[userId])
    statQueue[userId] = {}
  if(!statQueue[userId][stat])
    statQueue[userId][stat] = 0
  statQueue[userId][stat] += amount

  logger.log(`Added ${amount} to stat ${stat} of user ${userId}.`)
}


exports.update = async () => {
  const { logger } = client.util

  if(Object.keys(statQueue).length === 0)
    return
  
  logger.log(`Updating user stats...`)
  logger.log(JSON.stringify(statQueue, null, 4))

  const batch = db.batch()

  for(let user in statQueue) {
    if(!Object.keys(statQueue[user]).length) {
      delete statQueue[user]
      continue
    }

    let payload = {
      stats: {}
    }

    for(let stat in statQueue[user]) {
      if(!statQueue[user][stat]) // net change is zero
        continue // skip

      payload.stats[stat] = increment(statQueue[user][stat])
    }

    if(Object.keys(payload.stats).length) { // stats changes queued
      const docRef = db.collection("users").doc(user)
      batch.set(docRef, payload, { merge: true })
    }

    delete statQueue[user]
  }
  
  await batch.commit()
}