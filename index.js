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
const emoji = require("emojilib") // for automatic emoji thing for auto reactions
const emojiDictionary = require("emoji-dictionary") // also emojis
const translate = require("translate-google") // google translate i think
const schedule = require("node-schedule") // node scheduler
const stringSimilarity = require("string-similarity")

let karmaQueue = {}
let karmaCache = []
let pauseAutocarrotCache = {} // used for storing when people want g9lbot to stop autocarroting them
let commandCooldowns = {
  karma: {},
  // leaderboard: {},
}
let gameCache = { // for storing when people are playing g9lbot's games
  hangman: {}
}


let priorityExports = {
  Discord,
  client,
  config,
  fs,
  prefix,
}

module.exports = priorityExports


// stores logs that can be uploaded to a discord channel
client.logs = {}


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

client.functions = new Enmap()
loadJsFiles("./functions/", (name, func, directory, file) => {
  if(client.functions.get(name))
    return queueLog(`[✖] Failed to load FUNCTION from \`${file}\``)
  queueLog(`[✓] Loaded FUNCTION from \`${file}\``)
  client.functions.set(name, func)
})

client.util = new Enmap()
loadJsFiles("./util/", (name, tool, directory, file) => {
  if(client.util.get(name))
    return queueLog(`[✖] Failed to load UTIL from \`${file}\``)
  queueLog(`[✓] Loaded UTIL \`${file}\``)
  client.util.set(name, tool)
})


const logger = client.util.get("logger")
for(let loopLog of logQueue)
  logger.log(loopLog, "startup loading")


// setup ↑
// function imports ↓

const addKarma = client.functions.get("addKarma").run
const autocarrotWebhook = client.functions.get("autocarrotWebhook").run
const autoResponses = client.functions.get("autoResponses").run
const commandHelpEmbed = client.functions.get("commandHelpEmbed").run
const coopChannels = client.functions.get("coopChannels").run
const messageResponder = client.functions.get("messageResponder").run
const timeConvert = client.functions.get("timeConvert").run
const updateKarma = client.functions.get("updateKarma").run
const voteReactions = client.functions.get("voteReactions").run

// function imports ↑
// exports ↓

module.exports = {
  ...priorityExports,
  firebaseAdmin,
  db,
  Enmap,
  emoji,
  emojiDictionary,
  translate,
  schedule,
  stringSimilarity,
  karmaQueue,
  karmaCache,
  pauseAutocarrotCache,
  commandCooldowns,
  gameCache,

  addKarma,
  autocarrotWebhook,
  autoResponses,
  commandHelpEmbed,
  coopChannels,
  messageResponder,
  timeConvert,
  updateKarma,
  voteReactions,
}

// exports ↑


process.once("SIGTERM", async () => {
  updateKarma()
  client.util.get("logger").uploadLogs("Automatic log upload due to SIGTERM signal.", true)
  process.exit()
})

process.once("SIGINT", async () => {
  client.util.get("logger").uploadLogs("Automatic log upload due to SIGINT signal.", true)
  updateKarma()
})


client.login(process.env.TOKEN)
  .catch(err => console.log(err))