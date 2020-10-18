require("dotenv").config()

// .env ↑

const fs = require("fs")
const Discord = require("discord.js")
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] })
const config = require("./config/_config.js")
const prefix = config.main.prefix

const Enmap = require("enmap")
const timeFormatter = require("seconds-time-formatter")
const emoji = require("emojilib")
const emojiDictionary = require("emoji-dictionary")
const translate = require("translate-google")

// important declarations and imports ↑
// caches ↓

let pauseAutocarrotCache = {}
let gameCache = {
  hangman: {}
}

// caches ↑
// setup ↓

const loadJsFiles = async (directory, logMessage, callback) => {
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
    console.log(
      logMessage
        .replace(/%file%/gi, loopFile)
        .replace(/%item%/gi, name.toUpperCase())
    )
    callback(name, props, directory, loopFile)
  }
  console.log("============")
}

console.log("============")

loadJsFiles("./events/", "Loading event %item% from %file%", (name, event, directory, file) => {
  client.on(name, (message, newMessage) => event(client, message, newMessage)) // declare event listener
  delete require.cache[require.resolve(file)] // deleting a cache or something?
})

client.commands = new Enmap()
loadJsFiles("./commands/", "Loading command %item% from %file%", (name, command, directory, file) => {
})

client.functions = new Enmap()
loadJsFiles("./functions/", "Loading function %item% from %file%", (name, func, directory, file) => {
  client.functions.set(name, func)
})

client.util = new Enmap()
loadJsFiles("./util/", "Loading utility %item% from %file%", (name, tool, directory, file) => {
  client.util.set(name, tool)
})

// setup ↑
// function imports ↓

const autocarrotWebhook = (human, channel, content) => client.functions.get("autocarrotWebhook").run(client, human, channel, content)
const autoResponses = (message) => client.functions.get("autoResponses").run(client, message)
const coopChannels = (message) => client.functions.get("coopChannels").run(client, message)
const pog = (message) => client.functions.get("pog").run(client, message)

// function imports ↑
// exports ↓

module.exports = {
  Discord,
  client,
  config,
  fs,
  prefix,
  Enmap,
  timeFormatter,
  emoji,
  emojiDictionary,
  translate,
  gameCache,
  pauseAutocarrotCache,
  autocarrotWebhook,
  autoResponses,
  coopChannels,
  pog
}

// exports ↑

client.login(process.env.TOKEN)