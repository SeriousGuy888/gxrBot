require("dotenv").config() // .env

const fs = require("fs")
const path = require("path")

const Discord = require("discord.js")
const client = new Discord.Client({
  partials: [ // discord client with partials
    "USER",
    "CHANNEL",
    "MESSAGE",
    "GUILD_MEMBER",
    "REACTION"
  ],
  ws: {
    intents: new Discord.Intents(Discord.Intents.ALL)
  }
})

const config = require("./config/_config.js") // config file
const prefix = config.main.prefix // bot prefix

const firebaseAdmin = require("firebase-admin")
const firebaseServiceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(firebaseServiceAccountKey) })
const db = firebaseAdmin.firestore()
const auth = firebaseAdmin.auth()

const Enmap = require("enmap") // used for loading in the commands and functions and stuff
const QuickChart = require("quickchart-js")
const emoji = require("emojilib") // for automatic emoji thing for auto reactions
const emojiDictionary = require("emoji-dictionary") // also emojis
const translate = require("translate-google") // google translate i think
const schedule = require("node-schedule") // node scheduler
const stringSimilarity = require("string-similarity")
const ytdl = require("ytdl-core")
const googleTts = require("google-tts-api")

let preferenceCache = {
  default: {
    notifications: true
  }
}
let balanceCache = {}
let balanceQueue = {}
let inventoryQueue = {}
let badgeQueue = {}
let karmaQueue = {}
let karmaCache = []
let statQueue = {}
let graphCache = {
  karmaChange: {
    complete: false,
    cache: []
  }
}
let pauseAutocarrotCache = {} // used for storing when people want g9lbot to stop autocarroting them
let gameCache = { // for storing when people are playing g9lbot's games
  blackjack: {},
  hangman: {},
  minesweeper: {}
}

let priorityExports = {
  Discord,
  client,
  config,
  fs,
  path,
  prefix,
  firebaseAdmin,
  db,
  auth,

  stringSimilarity,

  preferenceCache,
  inventoryQueue,
  balanceCache,
  balanceQueue,
  badgeQueue,
  
  karmaQueue,
  karmaCache,
  statQueue,
  graphCache,
  pauseAutocarrotCache,
  gameCache,
}

module.exports = priorityExports


// stores logs that can be uploaded to a discord channel
client.logs = {}

// command cooldowns
client.commandCooldowns = {}

// setup ↓

let logQueue = []
const queueLog = str => logQueue.push(str)

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

  queueLog("============")
}

queueLog("============")


loadJsFiles("./events/", (name, event, directory, file) => {
  queueLog(`[✓] Loaded EVENT \`${file}\``) // log on load
  client.on(name, (message, newMessage) => event(client, message, newMessage)) // declare event listener
  delete require.cache[require.resolve(file)] // deleting a cache or something?
})

client.commands = new Enmap()
client.publicCommandList = []
loadJsFiles("./commands/", (name, command, directory, file) => {
  if(client.commands.get(name))
    return queueLog(`[✖] Failed to load COMMAND from \`${file}\``)
  queueLog(`[✓] Loaded COMMAND \`${file}\``) // log on load
  client.commands.set(name, command)
  if(!command.dev && !command.disabled)
    client.publicCommandList.push(name)
})

client.functions = {}
loadJsFiles("./functions/", (name, func, directory, file) => {
  if(client.functions[name])
    return queueLog(`[✖] Failed to load FUNCTION from \`${file}\``)
  queueLog(`[✓] Loaded FUNCTION from \`${file}\``)
  client.functions[name] = func
})

client.util = {}
loadJsFiles("./util/", (name, tool, directory, file) => {
  if(client.util[name])
    return queueLog(`[✖] Failed to load UTIL from \`${file}\``)
  queueLog(`[✓] Loaded UTIL \`${file}\``)
  client.util[name] = tool
})


const logger = client.util.logger
for(let loopLog of logQueue)
  logger.log(loopLog, "startup loading")


// setup ↑
// function and util imports ↓

const {
  addKarma,
  autocarrotWebhook,
  autoResponses,
  awaitOrders,
  commandHelpEmbed,
  coopChannels,
  extractArgs,
  getUserArg,
  messageResponder,
  propaganda,
  voteReactions
} = client.functions
const {
  badger,
  banker,
  embedder,
  guildPreferencer,
  messenger,
  permisser,
  preferencer,
  timer
} = client.util

// function and util imports ↑
// exports ↓

module.exports = {
  ...priorityExports,
  db,
  Enmap,
  QuickChart,
  emoji,
  emojiDictionary,
  translate,
  schedule,
  ytdl,
  googleTts,

  addKarma,
  autocarrotWebhook,
  autoResponses,
  awaitOrders,
  commandHelpEmbed,
  coopChannels,
  extractArgs,
  getUserArg,
  messageResponder,
  propaganda,
  voteReactions,

  banker,
  embedder,
  guildPreferencer,
  logger,
  messenger,
  permisser,
  preferencer,
  timer,
}

// exports ↑


// process.on("unhandledRejection", console.error)

process.once("SIGTERM", async () => {
  client.util.karmanator.update()
  client.util.statTracker.update()
  preferencer.update()
  guildPreferencer.update()
  badger.updateBadges()
  banker.updateBalances()
  banker.updateInventories()
  logger.uploadLogs("Automatic log upload due to SIGTERM signal.", true)
  process.exit()
})

process.once("SIGINT", async () => {
  client.util.karmanator.update()
  client.util.statTracker.update()
  preferencer.update()
  guildPreferencer.update()
  badger.updateBadges()
  banker.updateBalances()
  banker.updateInventories()
  logger.uploadLogs("Automatic log upload due to SIGINT signal.", true)
})


client.login(process.env.TOKEN)