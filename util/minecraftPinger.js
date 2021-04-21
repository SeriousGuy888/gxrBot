const index = require("../index.js")
const { db, firebaseAdmin } = index

const cache = require("../cache.js")
const minecraftTrackCache = cache.minecraftTrack

const axios = require("axios")

exports.ping = async (host, port) => {
  const serverAddress = `${host}:${parseInt(port) || 25565}`
  let response = await axios.get(`https://api.mcsrvstat.us/2/${serverAddress}`)
    .catch(err => {
      response = null
    })
  

  return response.data
}

exports.pingMinehut = async (name) => {
  let response
  response = await axios.get(`https://api.minehut.com/server/${name}?byName=true`)
    .catch(err => {
      response = null
    })

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


  let payload = minecraftTrackCache?.[collectionName]?.[currentIsoDate]?.payload ?? {}

  if(!responseData) {
    payload[this.getTimeString()] = {
      online: false,
      playerCount: 0,
    }
  }
  else {
    const serverOnline = responseData.online
    payload.timestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp()
  
    payload[this.getTimeString()] = {
      online: serverOnline,
      playerCount: responseData.playerCount,
    }
  }


  if(!minecraftTrackCache[collectionName]) minecraftTrackCache[collectionName] = {}
  if(!minecraftTrackCache[collectionName][currentIsoDate]) minecraftTrackCache[collectionName][currentIsoDate] = {}

  minecraftTrackCache[collectionName][currentIsoDate].payload = payload
}

exports.update = async () => {
  const batch = db.batch()

  for(const collectionName in minecraftTrackCache) {
    for(const docName in minecraftTrackCache[collectionName]) {
      if(docName === "cache") continue

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

exports.getTrackedData = async (collectionName, days) => {
  let allStats = {}

  const cachedStats = minecraftTrackCache?.[collectionName]?.cache
  if(cachedStats) {
    allStats = cachedStats
  }
  else {
    const collRef = db
      .collection("stats")
      .doc("minecraft_track")
      .collection(collectionName)
    const snapshot = await collRef
      .orderBy("timestamp", "asc")
      .limit(days)
      .get()
  
    snapshot.forEach(async doc => {
      const data = doc.data()
      for(const timeField in data) {
        if(timeField === "timestamp") continue
        allStats[`${doc.id}_${timeField}`] = data[timeField]
      }
    })

    if(!minecraftTrackCache[collectionName]) minecraftTrackCache[collectionName] = {}
    minecraftTrackCache[collectionName].cache = allStats
  }


  const cachedPayload = minecraftTrackCache?.[collectionName]?.[this.getIsoDate()]?.payload
  for(const timeField in cachedPayload) {
    if(timeField === "timestamp") continue
    allStats[`${this.getIsoDate()}_${timeField}`] = cachedPayload[timeField]
  }

  return allStats
}

exports.getIsoDate = () => `${new Date().getUTCFullYear()}-${(new Date().getUTCMonth() + 1).toString().padStart(2, "0")}-${new Date().getUTCDate().toString().padStart(2, "0")}`
exports.getTimeString = () => `${new Date().getUTCHours().toString().padStart(2, "0")}${new Date().getUTCMinutes().toString().padStart(2, "0")}`