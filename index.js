require("dotenv").config() // .env

const fs = require("fs")
const path = require("path")

const Discord = require("discord.js")
const { Client, Collection, Intents } = Discord
const client = new Client({
  partials: [ // discord client with partials
    "USER",
    "CHANNEL",
    "MESSAGE",
    "GUILD_MEMBER",
    "REACTION",
  ],
  intents: [ // i guess Intents.ALL doesnt exist
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: false,
  },
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
const schedule = require("node-schedule") // node scheduler
const stringSimilarity = require("string-similarity")
const axios = require("axios")
const csv = require("csvtojson")
const ytdl = require("ytdl-core")
const googleTts = require("google-tts-api")
const Canvas = require("canvas")
const Chess = require("@ninjapixel/chess").Chess

let {
  preferenceCache,
  balanceCache,
  balanceQueue,
  inventoryQueue,
  badgeQueue,
  karmaQueue,
  karmaLeaderboardCache,
  newKarmaCache,
  statQueue,
  statCache,
  graphCache,
  pauseAutocarrotCache,
  gameCache,
} = require("./cache.js")

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
  karmaLeaderboardCache,
  newKarmaCache,
  statQueue,
  statCache,
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

queueLog(process.env.DEV_MODE ? "Starting in dev mode..." : "Starting...")
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




// new slash commands ↓
// now using discord.js collections rather than enmap
// https://discordjs.guide/command-handling/

client.scommands = new Collection()
const scommandFiles = fs
  .readdirSync("./scommands")
  .filter(file => file.endsWith(".js"))


let slashCommandData = []

for(const file of scommandFiles) {
  const scommand = require(`./scommands/${file}`)
  client.scommands.set(scommand.name, scommand)
  
  slashCommandData.push({
    name: scommand.name,
    description: scommand.description
  })
}


// new slash commands ↑
// function and util imports ↓

const {
  autoResponses,
  awaitOrders,
  commandHelpEmbed,
  coopChannels,
  getUserArg,
  messageResponder,
  propaganda,
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
  schedule,
  ytdl,
  axios,
  csv,
  googleTts,
  Canvas,
  Chess,

  autoResponses,
  awaitOrders,
  commandHelpEmbed,
  coopChannels,
  getUserArg,
  messageResponder,
  propaganda,

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

const beforeShutdown = require("./before_shutdown.js")
beforeShutdown(async () => {
  await client.util.karmanator.update()
  await client.util.statTracker.update()
  await preferencer.update()
  await guildPreferencer.update()
  await badger.updateBadges()
  await banker.updateBalances()
  await banker.updateInventories()
  await client.util.minecraftPinger.update()
  
  await client.util.logger.uploadLogs("Automatic log upload on exit.", true)
  console.log("Shutting down!")
})

client.login(process.env.TOKEN)