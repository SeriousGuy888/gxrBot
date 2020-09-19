const token = require("./secrets/token.json")
const fs = require("fs")
const Discord = require("discord.js")
const client = new Discord.Client()
const config = require("./config/_config.js")
const prefix = config.main.prefix

const admin = require("firebase-admin")
const serviceAccount = require("./secrets/firestoreServiceAccountKey.json")
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
let db = admin.firestore()

const Enmap = require("enmap")
const timeFormatter = require("seconds-time-formatter")
const emoji = require("emojilib")
const emojiDictionary = require("emoji-dictionary")

// important declarations and imports ↑
// caches ↓

var cultCache = {}
var owsCache = {}

let cultDoc = db.collection("channels").doc("cult")
let owsDoc = db.collection("channels").doc("one_word_story")

cultDoc.onSnapshot(snapshot => {
  let path = snapshot._fieldsProto
  cultCache.id = path.id.stringValue
  cultCache.word = path.word.stringValue
  module.exports.cultCache = cultCache
}, err => {})

owsDoc.onSnapshot(snapshot => {
  let path = snapshot._fieldsProto
  owsCache.id = path.id.stringValue
  module.exports.owsCache = owsCache
}, err => {})



let pauseAutocarrotCache = {}
let gameCache = {
  hangman: {}
}

// caches ↑
// setup ↓

const loadEnmap = async (directory, callback) => {
  fs.readdir(directory, (err, files) => { // load files
    if(err) return console.error(err)
    files.forEach(file => {
      if(!file.endsWith(".js")) return // make sure file is a js file
      const props = require(`${directory}${file}`) // import file
      let name = file.split(".")[0] // name is file name minus extention

      callback(name, props, directory, file)
    })
    console.log("============")
  })
}

console.log("============")

loadEnmap("./events/", (name, event, directory, file) => {
  console.log(`Loading event ${name.toUpperCase()}`) // log on load
  client.on(name, (message, newMessage) => event(client, message, newMessage)) // declare event listener
  delete require.cache[require.resolve(`${directory}${file}`)] // deleting a cache or something?
})

client.commands = new Enmap()
loadEnmap("./commands/", (name, command, directory, file) => {
  console.log(`Loading command ${name.toUpperCase()}`) // log on load
  client.commands.set(name, command)
})

client.functions = new Enmap()
loadEnmap("./functions/", (name, func, directory, file) => {
  console.log(`Loading function ${name.toUpperCase()}`)
  client.functions.set(name, func)
})

client.util = new Enmap()
loadEnmap("./util/", (name, tool, directory, file) => {
  console.log(`Loading util tool ${name.toUpperCase}`)
  client.util.set(name, tool)
})

// setup ↑
// function imports ↓

const autocarrotWebhook = (human, channel, content) => client.functions.get("autocarrotWebhook").run(client, human, channel, content)
const autoResponses = (message) => client.functions.get("autoResponses").run(client, message)

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
  emoji,
  emojiDictionary,
  cultCache,
  gameCache,
  pauseAutocarrotCache,
  autocarrotWebhook,
  autoResponses
}

// exports ↑

client.login(token[0])