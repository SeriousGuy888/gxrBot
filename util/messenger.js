const { client } = require("..")

// * supposed to make stuff like sending dms easier. sending to a channel is not managed by this.
exports.dm = (userId, content) => {
  let message
  client.users.fetch(userId).then(user => {
    user.send(content).then(msg => message = msg)
  }).catch(err => {
    throw new Error(err)
  })
  return message
}