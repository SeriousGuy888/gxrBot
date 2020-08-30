const token = require("./secrets/token.json")
const fs = require("fs")
const Discord = require("discord.js")
const client = new Discord.Client()
const config = require("./config/_config.js")
const prefix = config.main.prefix

const admin = require("firebase-admin")
const serviceAccount = require("./secrets/firestoreServiceAccountKey.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
let db = admin.firestore()

const Enmap = require("enmap")
const timeFormatter = require("seconds-time-formatter")
const emojiDictionary = require("emoji-dictionary")

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

var owsCache = {}
let owsDoc = db.collection("channels").doc("one_word_story")
let owsObserver = owsDoc.onSnapshot(docSnapshot => {
  let path = docSnapshot._fieldsProto

  console.log("OWS channel change detected:")
  console.log(path.id.stringValue)

  owsCache.id = path.id.stringValue

  module.exports.owsCache = owsCache
}, err => {return})


let pauseAutocarrotCache = {}


let gameCache = {
  hangman: {}
}

// caches ↑
// setup ↓

console.log("============")

fs.readdir("./events", (err, files) => { // load events
  if(err) return console.error(err) // if error, return
  files.forEach(file => { // for each file,
    if(!file.endsWith(".js")) return // make sure file is a js file
    const event = require(`./events/${file}`) // import event file
    let eventName = file.split(".")[0] // event name is file name minus extention
    client.on(eventName, (message, newMessage) => event(client, message, newMessage)) // declare event listener
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

client.functions = new Enmap()

fs.readdir("./functions/", (err, files) => {
  if(err) return console.error(err)

  files.forEach(file => {
    if(!file.endsWith(".js")) return
    let props = require(`./functions/${file}`)
    let funcName = file.split(".")[0]
    
    console.log(`Loading function ${funcName.toUpperCase()}`)
    client.functions.set(funcName, props)
  })
  console.log("============")
})

// setup ↑
// function imports ↓

const autocarrotWebhook = (human, channel, content) => client.functions.get("autocarrotWebhook").run(client, human, channel, content)

// function imports ↑
// exports ↓

module.exports = {
  Discord,
  client,
  config,
  fs,
  prefix,
  admin,
  db,
  Enmap,
  timeFormatter,
  emojiDictionary,
  cultCache,
  gameCache,
  pauseAutocarrotCache,
  autocarrotWebhook
}

// exports ↑

client.login(token[0])