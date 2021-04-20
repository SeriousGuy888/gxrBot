const index = require("../index.js")
const { db, firebaseAdmin } = index

const cache = require("../cache.js")
const minecraftTrackCache = cache.minecraftTrack

const axios = require("axios")

exports.ping = async (host, port) => {
  const serverAddress = `${host}:${parseInt(port) || 25565}`
  const responseData = (await axios.get(`https://api.mcsrvstat.us/2/${serverAddress}`)).data

  return responseData
}

exports.pingMinehut = async (name) => {
  const response = (await axios.get(`https://api.minehut.com/server/${name}?byName=true`))

  if(response.status === 200) {
    let responseData = response.data.server

    const pluginsData = await axios.get("https://api.minehut.com/plugins_public")
    if(pluginsData.data && pluginsData.data.all) {
      const allPlugins = pluginsData.data.all

      let decodedPlugins = []
      for(const plugin of allPlugins) {
        for(const pluginId of responseData.active_plugins) {
          if(plugin._id === pluginId) {
            decodedPlugins.push(`${plugin.name} \`${plugin.version}\``)
          }
        }
      }

      responseData.plugins = decodedPlugins.sort()
    }
    return responseData
  }
  else {
    return null
  }
}

exports.recordMinehut = async (name, collectionName) => {
  const responseData = await this.pingMinehut(name)

  const currentIsoDate = this.getIsoDate()


  if(!responseData) {
    return
  }


  const serverOnline = responseData.online

  let payload = minecraftTrackCache?.[collectionName]?.[currentIsoDate]?.payload ?? {}
  payload.timestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp()

  payload[this.getTimeString()] = {
    online: serverOnline,
    players: {
      online: serverOnline ? responseData.playerCount : 0,
      max: serverOnline ? responseData.maxPlayers : 0,
    },
  }

  if(!minecraftTrackCache[collectionName]) minecraftTrackCache[collectionName] = {}
  if(!minecraftTrackCache[collectionName][currentIsoDate]) minecraftTrackCache[collectionName][currentIsoDate] = {}

  minecraftTrackCache[collectionName][currentIsoDate].payload = payload
}

exports.update = async () => {
  const batch = db.batch()

  for(const collectionName in minecraftTrackCache) {
    for(const docName in minecraftTrackCache[collectionName]) {
      const docRef = db
        .collection("stats")
        .doc("minecraft_track")
        .collection(collectionName)
        .doc(docName)
      
      batch.set(docRef, minecraftTrackCache[collectionName][docName].payload, { merge: true })
    }
  }

  batch.commit()
}

exports.getIsoDate = () => `${new Date().getUTCFullYear()}-${(new Date().getUTCMonth() + 1).toString().padStart(2, "0")}-${new Date().getUTCDate().toString().padStart(2, "0")}`
exports.getTimeString = () => `${new Date().getUTCHours().toString().padStart(2, "0")}${new Date().getUTCMinutes().toString().padStart(2, "0")}`