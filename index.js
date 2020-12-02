require("dotenv").config() // .env

const fs = require("fs")
const Discord = require("discord.js")
const client = new Discord.Client({
  partials: [ // discord client with partials
    "USER",
    "CHANNEL",
    "MESSAGE",
    "GUILD_MEMBER",
    "REACTION"
  ]
})
const config = require("./config/_config.js") // config file
const prefix = config.main.prefix // bot prefix

const firebaseAdmin = require("firebase-admin")
const firebaseServiceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(firebaseServiceAccountKey) })
const db = firebaseAdmin.firestore()

const Enmap = require("enmap") // used for loading in the commands and functions and stuff
const timeFormatter = require("seconds-time-formatter") // my own npm package that is very badly written 
const emoji = require("emojilib") // for automatic emoji thing for auto reactions
const emojiDictionary = require("emoji-dictionary") // also emojis
const translate = require("translate-google") // google translate i think
const schedule = require("node-schedule") // node scheduler
const stringSimilarity = require("string-similarity")

let karmaQueue = {}
let pauseAutocarrotCache = {} // used for storing when people want g9lbot to stop autocarroting them
let commandCooldowns = {
  karma: {},
  leaderboard: {}
}
let gameCache = { // for storing when people are playing g9lbot's games
  hangman: {}
}

// setup ↓

const loadJsFiles = async (directory, callback) => {
  // * crawls through all subdirectories and returns an array of files
  const crawl = (dir, fileList = []) => {
    const files = fs.readdirSync(dir)
    if(!dir.endsWith("/")) dir += "/"
    files.forEach(file => {
      if(fs.statSync(dir + file).isDirectory())
        fileList = crawl(dir + file + "/", fileList)
      else {
        if(file.endsWith(".js")) fileList.push(dir + file)
      }
    })
    return fileList
  }

  const jsFiles = crawl(directory)
  for(let loopFile of jsFiles) {
    const props = require(loopFile) // import file
    
    let name = loopFile.split("/").pop().split(".")[0]
    callback(name, props, directory, loopFile)
  }
  console.log("============")
}

console.log("============")

loadJsFiles("./events/", (name, event, directory, file) => {
  console.log(`[✓] Successfully loaded event ${name.toUpperCase()} from ${file}`) // log on load
  client.on(name, (message, newMessage) => event(client, message, newMessage)) // declare event listener
  delete require.cache[require.resolve(file)] // deleting a cache or something?
})

client.commands = new Enmap()
client.publicCommandList = []
loadJsFiles("./commands/", (name, command, directory, file) => {
  if(client.commands.get(name))
    return console.log(`[✖] Failed to load command from ${file} - Name Taken`)
  console.log(`[✓] Successfully loaded command ${name.toUpperCase()} from ${file}`) // log on load
  client.commands.set(name, command)
  if(!command.dev && !command.disabled)
    client.publicCommandList.push(name)
})

client.functions = new Enmap()
loadJsFiles("./functions/", (name, func, directory, file) => {
  if(client.functions.get(name))
    return console.log(`[✖] Failed to load function from ${file} - Name Taken`)
  console.log(`[✓] Successfully loaded function ${name.toUpperCase()} from ${file}`)
  client.functions.set(name, func)
})

client.util = new Enmap()
loadJsFiles("./util/", (name, tool, directory, file) => {
  if(client.util.get(name))
    return console.log(`[✖] Failed to load utility from ${file} - Name Taken`)
  console.log(`[✓] Successfully loaded utility ${name.toUpperCase()} from ${file}`)
  client.util.set(name, tool)
})

// setup ↑
// function imports ↓

const addKarma = (user, amount) => client.functions.get("addKarma").run(client, user, amount)
const autocarrotWebhook = (human, message) => client.functions.get("autocarrotWebhook").run(client, human, message)
const autoResponses = (message) => client.functions.get("autoResponses").run(client, message)
const commandHelpEmbed = (message, options) => client.functions.get("commandHelpEmbed").run(client, message, options)
const coopChannels = (message) => client.functions.get("coopChannels").run(client, message)
const messageResponder = (message) => client.functions.get("messageResponder").run(client, message)
const propaganda = () => client.functions.get("propaganda").run(client)
const timeConvert = (milliseconds) => client.functions.get("timeConvert").run(client, milliseconds)
const updateKarma = () => client.functions.get("updateKarma").run(client)

// function imports ↑
// exports ↓

module.exports = {
  Discord,
  client,
  config,
  fs,
  prefix,
  firebaseAdmin,
  db,
  Enmap,
  timeFormatter,
  emoji,
  emojiDictionary,
  translate,
  schedule,
  stringSimilarity,
  karmaQueue,
  pauseAutocarrotCache,
  commandCooldowns,
  gameCache,
  addKarma,
  autocarrotWebhook,
  autoResponses,
  commandHelpEmbed,
  coopChannels,
  messageResponder,
  propaganda,
  timeConvert,
  updateKarma,
}

// exports ↑

client.login(process.env.TOKEN)
  .catch(err => console.log(err))