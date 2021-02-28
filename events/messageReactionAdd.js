module.exports = async (client, reaction, user) => {
  const { voteReactions } = client.functions

  let message = reaction.message
  if(reaction.message.partial)
    message = await reaction.message.fetch()

  voteReactions(reaction, user, false)
}