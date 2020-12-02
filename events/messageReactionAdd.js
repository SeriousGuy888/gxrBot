module.exports = async (client, reaction, user) => {
  const index = require("../index.js")
  const { voteReactions } = index


  let message = reaction.message
  if(reaction.message.partial)
    message = await reaction.message.fetch()

  voteReactions(reaction, user, false)
}