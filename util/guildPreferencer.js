const index = require("../index.js")
const { db } = index


let guildPreferenceCache = {
  default: {
    autocarrot_enabled: {
      type: "boolean",
      allowNull: false,
      value: false,
      emoji: "🥕",
      description: [
        "Will detect messages sent containing swear words and slurs and correct",
        "them to what the author actually meant to write."
      ].join("\n")
    },
    changelog_channel_id: {
      type: "string",
      allowNull: true,
      value: null,
      emoji: "📜",
      description: "The ID of a channel in this server to receive changelogs. Set to null to opt out."
    },
    disabled_commands: {
      type: "string",
      allowNull: true,
      value: "spam_ping,test",
      emoji: "🚫",
      description: "Names of commands to disable in this server, separated by commas."
    },
    admins_bypass_disabled_commands: {
      type: "boolean",
      allowNull: false,
      value: false,
      emoji: "🏸",
      description: "Whether members with Administrator or Manage Server permissions can use commands in the DISABLED_COMMANDS setting."
    },
  }
}
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
      preferences[i] = guildPreferenceCache.default[i].value
  }

  guildPreferenceCache[guildId] = preferences

  const preferenceKeys = Object.keys(preferences).sort()
  let sortedPreferences = {}
  for(const key of preferenceKeys) {
    sortedPreferences[key] = preferences[key]
  }

  return sortedPreferences
}

exports.set = async (guildId, preference, value) => {
  await this.get(guildId) // updates the preference cache

  const fieldType = guildPreferenceCache.default[preference].type
  const allowNull = guildPreferenceCache.default[preference].allowNull

  let parsedValue = value
  switch(fieldType) {
    case "boolean":
      switch(parsedValue.toLowerCase().charAt(0)) {
        case "y":
        case "t":
          parsedValue = true
          break
        case "n":
        case "f":
          parsedValue = false
          break
      }
      break
    case "number":
      let parsedNum = parseInt(parsedValue)
      if(parsedNum.isNaN)
        break
      else
        parsedValue = parsedNum
      break
  }
  
  const inputType = typeof parsedValue
  if(inputType === "string")
    parsedValue = parsedValue.slice(0, 1000) // limits strings to 1000 characters

  if(((fieldType && inputType !== fieldType) && !(allowNull && value === null))) {
    return `❌ The field \`${preference}\` only accepts values of type \`${fieldType + (allowNull ? "` and `null" : "")}\`, but the input provided was of type \`${typeof value}\`.`
  }


  guildPreferenceCache[guildId][preference] = parsedValue
  updatedGuilds.push(guildId)
  return `✅ Set \`${preference}\` to \`${parsedValue}\`.`
}

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

exports.default = () => guildPreferenceCache.default
exports.isValid = (preference) => Object.keys(guildPreferenceCache.default).includes(preference) // returns whether a preference is valid