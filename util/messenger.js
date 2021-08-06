/*
  * Made for things like sending DMs which can be really ducking annoying.
  * Also made for sending messages with user content in them.
*/

const index = require("../index.js")
const { client, config, Discord } = index

exports.sanitise = async content => {
  if(typeof content !== "string")
    return content

  let sanitisedContent = content.match(/(.|\n){1,2000}/g)[0]
  if(sanitisedContent.length === 0) sanitisedContent = "**Error:** Message Empty"
  
  return sanitisedContent
}

exports.send = async (channel, content) => {
  let sanitisedContent

  if(typeof content === "string") this.sanitise(content).then(c => sanitisedContent = c)
  else sanitisedContent = content

  return await channel.send(typeof sanitisedContent === "string" ? { content: sanitisedContent } : sanitisedContent)
}

exports.dm = async (userId, content, callback) => {
  const user = await client.users.fetch(userId)
  const sanitised = await this.sanitise(content)
  user.send(typeof sanitised === "string" ? { content: sanitised } : sanitised )
    .then(msg => {
      if(callback)
        callback(msg)
    })
    .catch(() => {})
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
  
  return await this.send(channel, { embeds: [emb] })
}

exports.errorMessage = async (channelOrMessage, options, newMessage) => {
  if(!options)
    options = {}
  
  const emb = new Discord.MessageEmbed()
    .setColor(options.colour ?? config.main.colours.error)
    .setTitle(`${options.title || "Error"}`)
    .setDescription(options.description || "No specific information provided.")
  
  if(options.footer)
    emb.setFooter(options.footer)
  
  if(newMessage) return await this.send(channelOrMessage, { embeds: [emb] })
  else return await channelOrMessage.edit({ embeds: [emb] })
}