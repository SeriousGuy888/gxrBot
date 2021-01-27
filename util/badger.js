const index = require("../index.js")
const { client, firebaseAdmin, db } = index
const { arrayRemove, arrayUnion } = firebaseAdmin.firestore.FieldValue
let { badgeQueue } = index


exports.getBadges = async userId => {
  const userRef = db.collection("users").doc(userId)
  const doc = await userRef.get()

  let badges = new Set()

  if(doc.exists) {
    let data = doc.data()

    if(data.badges) // if database record for user's badges exists
      badges = new Set(data.badges) // read record and use as badges
  }

  if(!badgeQueue[userId])
    badgeQueue[userId] = {}

  for(const badge of Object.keys(badgeQueue[userId])) {
    badges.add(badge)
  }

  return [...badges] // cast set to array
}

exports.addBadge = async (userId, badge, remove) => {
  const { logger } = client.util

  if(!badgeQueue[userId])
    badgeQueue[userId] = {}

  badgeQueue[userId][badge] = { remove }

  logger.log(`${remove ? "Removed" : "Granted"} badge \`${badge}\` to user ${userId}.`)
}


exports.updateBadges = async () => {
  const { logger } = client.util

  if(Object.keys(badgeQueue).length === 0)
    return
  
  logger.log(`Updating user badges...`)
  logger.log(JSON.stringify(badgeQueue, null, 4))

  const batch = db.batch()

  for(let user in badgeQueue) {
    if(!Object.keys(badgeQueue[user]).length) {
      delete badgeQueue[user]
      continue
    }

    let toAdd = []
    let toRemove = []
    for(const i in badgeQueue[user]) {
      if(badgeQueue[user][i].remove)
        toRemove.push(i)
      else
        toAdd.push(i)
    }

    const docRef = db.collection("users").doc(user)
    if(toAdd.length)
      batch.update(docRef, "badges", arrayUnion(...toAdd))
    if(toRemove.length)
      batch.update(docRef, "badges", arrayRemove(...toRemove))

    delete badgeQueue[user]
  }
  
  await batch.commit()
}