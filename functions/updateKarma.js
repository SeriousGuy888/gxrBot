exports.run = async () => {
  const index = require("../index.js")
  const { client, firebaseAdmin, db } = index
  let { karmaQueue, karmaCache } = index

  const logger = client.util.get("logger")

  if(Object.keys(karmaQueue).length === 0)
    return
  
  logger.log(`Updating karma...`, "updateKarma")
  logger.log(JSON.stringify(karmaQueue, null, 4))

  let dbChanges = false
  let totalKarmaChanges = Object.values(karmaQueue).reduce((acc, curr) => acc + curr)

  for(let i in karmaQueue) {
    if(!karmaQueue[i]) {
      delete karmaQueue[i]
      continue // don't bother database if net change is zero
    }

    const increment = firebaseAdmin.firestore.FieldValue.increment(karmaQueue[i]) // increment by net change
    const docRef = db.collection("users").doc(i)

    let payload = {
      karma: increment
    }
    const user = client.users.cache.find(u => u.id === i) // caches the user's tag for leaderboard or somehting
    if(user) {
      payload.tag = user.tag
      payload.avatar = user.avatarURL({ dynamic: true })
    }

  
    await docRef.set(payload, { merge: true })

    delete karmaQueue[i]
    dbChanges = true
  }

  if(dbChanges) {
    karmaCache.splice(0, karmaCache.length)
    if(totalKarmaChanges) {
      const dateStr = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
      const increment = firebaseAdmin.firestore.FieldValue.increment(totalKarmaChanges)

      const docRef = db
        .collection("stats")
        .doc("karma_votes")
        .collection("dates")
        .doc(dateStr)
      const payload = {
        total: increment
      }

      await docRef.set(payload, { merge: true })
    }
  }
}