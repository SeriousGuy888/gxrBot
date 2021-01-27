const index = require("../index.js")
const { preferenceCache, db } = index

let updatedUsers = []

exports.get = async (userId) => {
  const userRef = db.collection("users").doc(userId)

  let preferences = {}
  if(preferenceCache[userId]) {
    preferences = preferenceCache[userId]
  }
  else {
    const doc = await userRef.get()
    const data = doc.data()

    if(data.settings)
      preferences = data.settings
  }

  for(const i in preferenceCache.default) { // any unset settings will be set to the default value
    if(preferences[i] === undefined)
      preferences[i] = preferenceCache.default[i]
  }

  preferenceCache[userId] = preferences
  return preferences
}

exports.set = async (userId, preference, value) => {
  await this.get(userId) // updates the preference cache
  preferenceCache[userId][preference] = value
  updatedUsers.push(userId)
}

exports.update = async () => {
  const batch = db.batch()

  for(const userId of updatedUsers) {
    const userRef = db.collection("users").doc(userId)
    const payload = {
      settings: preferenceCache[userId]
    }

    batch.set(userRef, payload, { merge: true })
  }

  await batch.commit()
}