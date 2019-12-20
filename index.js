const Discord = require("discord.js")
const client = new Discord.Client()
const fs = require("fs")
const config = require("./config.json")
const prefix = config.prefix
const token = require("./secrets/token.json")

client.on("ready", () => {
  console.log("ready")
})

client.login(token[0])