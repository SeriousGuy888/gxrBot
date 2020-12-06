/*
  * Made for things like sending DMs which can be really ducking annoying.
  * Also made for sending messages with user content in them.
*/

const index = require("../index.js")
const { client } = index

exports.sanitize = async content => {
  let sanitizedContent = content.match(/(.|\n){1,2000}/g)[0]
  if(sanitizedContent.length === 0)
    sanitizedContent = "**Error:** Message Empty"
  
  return sanitizedContent
}

exports.send = async (channel, content, callback) => {
  let sanitizedContent

  if(typeof content === "string")
    this.sanitize(content).then(c => sanitizedContent = c)
  else
    sanitizedContent = content

  const msg = await channel.send(sanitizedContent)

  if(callback)
    callback(msg)
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