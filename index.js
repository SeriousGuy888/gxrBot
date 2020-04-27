const token = require("./secrets/token.json")
const Discord = require("discord.js")
const client = new Discord.Client()
const config = require("./config.json")
const fs = require("fs")
const prefix = config.prefix

const admin = require("firebase-admin")
const serviceAccount = require("./secrets/firestoreServiceAccountKey.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
let db = admin.firestore()

const Enmap = require("enmap")
const timeFormatter = require("seconds-time-formatter")

// important declarations and imports ↑
// caches ↓

var cultCache = {}
let cultDoc = db.collection("channels").doc("cult")
let cultObserver = cultDoc.onSnapshot(docSnapshot => {
  let path = docSnapshot._fieldsProto

  console.log("Cult channel change detected:")
  console.log(path.id.stringValue + "\n" + path.word.stringValue)

  cultCache.id = path.id.stringValue
  cultCache.word = path.word.stringValue

  module.exports.cultCache = cultCache
}, err => {return})

var kashCache = {}
let kashDoc = db.collection("channels").doc("cult")
let kashObserver = kashDoc.onSnapshot(docSnapshot => {
  let path = docSnapshot._fieldsProto

  // console.log(path)

  // console.log("kash change:")
  // console.log(path.id.stringValue + "\n" + path.word.stringValue)

  // kashCache.id = path.id.stringValue
  // kashCache.word = path.word.stringValue

  module.exports.kashCache = kashCache
}, err => {return})

// caches ↑
// exports ↓

module.exports.Discord = Discord
module.exports.client = client
module.exports.config = config
module.exports.fs = fs
module.exports.prefix = prefix

module.exports.admin = admin
module.exports.db = db

module.exports.Enmap = Enmap
module.exports.timeFormatter = timeFormatter

module.exports.cultCache = cultCache

// exports ↑
// setup ↓

console.log("============")

fs.readdir("./events", (err, files) => { // load events
  if(err) return console.error(err) // if error, return
  files.forEach(file => { // for each file,
    if(!file.endsWith(".js")) return // make sure file is a js file
    const event = require(`./events/${file}`) // import event file
    let eventName = file.split(".")[0] // event name is file name minus extention
    client.on(eventName, message => event(client, message)) // declare event listener
    console.log(`Loading event ${eventName.toUpperCase()}`) // log on load
    delete require.cache[require.resolve(`./events/${file}`)] // idk
  })
  console.log("============")
})

client.commands = new Enmap()

fs.readdir("./commands/", (err, files) => {
  if(err) return console.error(err) // if error, return
  files.forEach(file => { // for each file,
    if(!file.endsWith(".js")) return // make sure file is a js file
    let props = require(`./commands/${file}`) // import event file
    let commandName = file.split(".")[0] // event name is file name minus extention
    console.log(`Loading command ${commandName.toUpperCase()}`) // log on load
    client.commands.set(commandName, props)
  })
  console.log("============")
})

// setup ↑
// i dont care enough to do this smartly ↓

// client.on("guildMemberAdd", member => {
//   const g8cId = "587769144619958273"
//   const kashId = "400677037469335582"
  
//   // if(member.guild.id != g8cId) return
//   // if(member.user.id != kashId) return

//   let doc = db.collection("kash").doc("joins")

//   doc.set({count: }, {merge: false}).then(() => {
//     message.channel.send("Channel set!")
//   })
// })

// i dont care enough to do this smartly ↑


client.login(token[0])