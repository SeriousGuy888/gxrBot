module.exports = async (client, reaction, user) => {
  const { karmanator } = client.util

  let message = reaction.message
  if(reaction.message.partial)
    message = await reaction.message.fetch()

  karmanator.countVote(reaction, user, false)
}