const { Discord } = require("../index.js")
const index = require("../index.js")
const { client, config, firebaseAdmin, db } = index
const badgeData = config.badges
let { badgeQueue } = index
const { arrayRemove, arrayUnion } = firebaseAdmin.firestore.FieldValue


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

  return [...badges].sort() // cast set to array and sort
}

exports.addBadge = async (userId, badge, remove) => {
  const { logger } = client.util

  if(!badgeQueue[userId])
    badgeQueue[userId] = {}

  badgeQueue[userId][badge] = { remove }

  logger.log(`${remove ? "Removed" : "Granted"} badge \`${badge}\` to user ${userId}.`)
}

exports.awardBadge = async (userId, badge, remove, reason) => {
  const { messenger, preferencer, embedder } = client.util

  if((await this.getBadges(userId)).includes(badge)) {
    return
  }

  await this.addBadge(userId, badge, remove)

  const notifPrefs = (await preferencer.get(userId)).notifications
  if(notifPrefs) {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle("Badge Awarded")
      .setDescription([
        `You have been awarded a badge for reason \`${reason ?? "no reason provided"}\`, which is quite cool.`,
        `You can check what badges you have with \`${config.main.prefix}prof\`.`
      ].join("\n"))
    embedder.addBlankField(emb)
      .addField((badgeData[badge].emoji + " " ?? "") + badge.toUpperCase(), badgeData[badge].description ?? "No description provided.")
    embedder.addBlankField(emb)
      .addField("-", `*PS: You can disable these notifications by disabling the corresponding setting with the command \`${config.main.prefix}settings\`.*`)

    messenger.dm(userId, emb)
  }
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

exports.badgeData = () => badgeData