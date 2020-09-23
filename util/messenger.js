/*
  * Made for things like sending DMs which can be really ducking annoying.
  * Also made for sending messages with user content in them.
*/

exports.validate = async content => {
  return content.slice(0, 2000)
}

exports.send = async (client, channel, content, callback) => {
  let message = await channel.send(typeof content === "string" ? this.validate(content) : content)
  if(callback) callback(message)
}

exports.dm = async (client, userId, content, callback) => {
  client.users.fetch(userId).then(user => {
    user.send(content).then(message => {
      if(callback) callback(message)
    })
  }).catch(err => {
    throw new Error(err)
  })
}