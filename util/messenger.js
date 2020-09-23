/*
  * Made for things like sending DMs which can be really ducking annoying.
  * Also made for sending messages with user content in them.
*/

exports.send = (client, channel, content) => {
  channel.send(content)
}

exports.dm = (client, userId, content, callback) => {
  client.users.fetch(userId).then(user => {
    user.send(content).then(message => {
      if(callback) callback(message)
    })
  }).catch(err => {
    throw new Error(err)
  })
}