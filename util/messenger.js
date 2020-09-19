const { client } = require("..")

// * supposed to make stuff like sending dms easier. sending to a channel is not managed by this.
exports.dm = (userId, content) => {
  const user = client.users.fetch(userId)
  if(!user) throw new Error(`Failed to retrieve user \`${userId}\``)
  user.send(content)
}