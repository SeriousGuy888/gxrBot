const index = require("../index.js")
const { guildPreferenceCache, db } = index

let updatedGuilds = []

exports.get = async (guildId) => {
  const guildRef = db.collection("guilds").doc(guildId)

  let preferences = {}
  if(guildPreferenceCache[guildId]) {
    preferences = guildPreferenceCache[guildId]
  }
  else {
    const doc = await guildRef.get()
    const data = doc.exists ? doc.data() : {}

    if(data.settings)
      preferences = data.settings
  }

  for(const i in guildPreferenceCache.default) { // any unset settings will be set to the default value
    if(preferences[i] === undefined)
      preferences[i] = guildPreferenceCache.default[i]
  }

  guildPreferenceCache[guildId] = preferences
  return preferences
}

exports.set = async (guildId, preference, value) => {
  await this.get(guildId) // updates the preference cache
  guildPreferenceCache[guildId][preference] = value
  updatedGuilds.push(guildId)
}

exports.isValid = (preference) => Object.keys(guildPreferenceCache.default).includes(preference) // returns whether a preference is valid

exports.update = async () => {
  const batch = db.batch()

  for(const guildId of updatedGuilds) {
    const guildRef = db.collection("guilds").doc(guildId)
    const payload = {
      settings: guildPreferenceCache[guildId]
    }

    batch.set(guildRef, payload, { merge: true })
  }

  await batch.commit()
}