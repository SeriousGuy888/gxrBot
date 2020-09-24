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
  console.log(`Loading event ${name.toUpperCase()}`) // log on load
  client.on(name, (message, newMessage) => event(client, message, newMessage)) // declare event listener
  delete require.cache[require.resolve(file)] // deleting a cache or something?
})

client.commands = new Enmap()
loadJsFiles("./commands/", (name, command, directory, file) => {
  console.log(`Loading command ${name.toUpperCase()}`) // log on load
  client.commands.set(name, command)
})

client.functions = new Enmap()
loadJsFiles("./functions/", (name, func, directory, file) => {
  console.log(`Loading function ${name.toUpperCase()}`)
  client.functions.set(name, func)
})

client.util = new Enmap()
loadJsFiles("./util/", (name, tool, directory, file) => {
  console.log(`Loading util tool ${name.toUpperCase()}`)
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
  Enmap,
  timeFormatter,
  emoji,
  emojiDictionary,
  gameCache,
  pauseAutocarrotCache,
  autocarrotWebhook,
  autoResponses
}

// exports ↑

client.login(process.env.TOKEN)