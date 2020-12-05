/*
  * Made for things like sending DMs which can be really ducking annoying.
  * Also made for sending messages with user content in them.
*/

const index = require("../index.js")
const { client } = index

exports.validate = async content => {
  let sanitizedContent = content.match(/(.|\n){1,2000}/g)[0]
  if(sanitizedContent.length === 0)
    sanitizedContent = "**Error:** Message Empty"
  
  return sanitizedContent
}

exports.send = async (channel, content, callback) => {
  let message = await channel.send(typeof content === "string" ? this.validate(content) : content)
  if(callback)
    callback(message)
}

exports.dm = async (userId, content, callback) => {
  client.users.fetch(userId)
    .then(user => {
      user.send(await this.validate(content))
        .then(message => {
          if(callback)
            callback(message)
        })
    })
    .catch(err => {
      throw new Error(err)
    })
}