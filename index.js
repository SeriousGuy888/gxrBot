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
loadJsFiles("./commands/", (name, command, directory, file) => {
  if(client.commands.get(name))
    return console.log(`[✖] Failed to load command from ${file} - Name Taken`)
  console.log(`[✓] Successfully loaded command ${name.toUpperCase()} from ${file}`) // log on load
  client.commands.set(name, command)
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

const autocarrotWebhook = (human, message) => client.functions.get("autocarrotWebhook").run(client, human, message)
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