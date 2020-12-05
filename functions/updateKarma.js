exports.run = async () => {
  const index = require("../index.js")
  const { client, firebaseAdmin, db } = index
  let { karmaQueue, karmaCache } = index

  const logger = client.util.get("logger")

  if(Object.keys(karmaQueue).length === 0)
    return
  
  logger.log(`Updating karma...`)
  logger.log(JSON.stringify(karmaQueue, null, 4))

  let dbChanges = false
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
    if(user)
      payload.tag = user.tag

  
    await docRef.set(payload, { merge: true })

    delete karmaQueue[i]
    dbChanges = true
  }

  if(dbChanges)
    karmaCache.splice(0, karmaCache.length)
}