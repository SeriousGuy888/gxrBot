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

// important declarations and imports ↑
// caches ↓

var cultCache = {}
let doc = db.collection("channels").doc("cult");
let observer = doc.onSnapshot(docSnapshot => {
  console.log(`Received doc snapshot: ${docSnapshot}`)
  // ...
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

client.login(token[0])