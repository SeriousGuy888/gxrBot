/*
  * Made for things like sending DMs which can be really ducking annoying.
  * Also made for sending messages with user content in them.
*/

const index = require("../index.js")
const { client, config, Discord } = index

exports.sanitize = async content => {
  if(typeof content !== "string")
    return content

  let sanitizedContent = content.match(/(.|\n){1,2000}/g)[0]
  if(sanitizedContent.length === 0)
    sanitizedContent = "**Error:** Message Empty"
  
  return sanitizedContent
}

exports.send = async (channel, content) => {
  let sanitizedContent

  if(typeof content === "string")
    this.sanitize(content).then(c => sanitizedContent = c)
  else
    sanitizedContent = content

  return await channel.send(sanitizedContent)
}

exports.dm = async (userId, content, callback) => {
  const user = await client.users.fetch(userId)
  const sanitized = await this.sanitize(content)
  user.send(sanitized)
    .then(msg => {
      if(callback)
        callback(msg)
    })
}

exports.loadingMessage = async (channel, options) => {
  if(!options)
    options = {}
  
  const emb = new Discord.MessageEmbed()
    .setColor(options.colour ?? config.main.colours.help)
    .setTitle(`${config.main.emojis.loading} ${options.title || "Loading"}`)
    .setDescription(options.description || "Please wait...")
  
  if(options.footer)
    emb.setFooter(options.footer)
  
  return await this.send(channel, emb)
}

exports.errorMessage = async (channel, options) => {
  if(!options)
    options = {}
  
  const emb = new Discord.MessageEmbed()
    .setColor(options.colour ?? config.main.colours.error)
    .setTitle(`${options.title || "Error"}`)
    .setDescription(options.description || "No specific information provided.")
  
  if(options.footer)
    emb.setFooter(options.footer)
  
  return await this.send(channel, emb)
}