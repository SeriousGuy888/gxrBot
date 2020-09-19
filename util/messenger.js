const { client } = require("..")

// * supposed to make stuff like sending dms easier. sending to a channel is not managed by this.
exports.dm = (userId, content, callback) => {
  client.users.fetch(userId).then(user => {
    user.send(content).then(message => {
      if(callback) callback(message)
    })
  }).catch(err => {
    throw new Error(err)
  })
}