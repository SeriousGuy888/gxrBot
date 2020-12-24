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
  client.users.fetch(userId)
    .then(user => {
      this.sanitize(content)
        .then(sanitized => {
          user.send(sanitized)
            .then(message => {
              if(callback)
                callback(message)
            })
        })
    })
    .catch(err => {
      throw new Error(err)
    })
}

exports.loadingMessage = async (channel, options) => {
  if(!options)
    throw new Error("No options specified.")
  
  const emb = new Discord.MessageEmbed()
    .setColor(options.colour ?? config.main.colours.help)
    .setTitle(`${config.main.emojis.loading} ${options.title || "Loading"}`)
    .setDescription(options.description || "Please wait...")
  
  if(options.footer)
    emb.setFooter(options.footer)
  
  return await this.send(channel, emb)
}