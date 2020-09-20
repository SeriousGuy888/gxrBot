module.exports = async (client, reaction, user) => {
  return
  if(reaction.message.partial) {
    const message = await reaction.message.fetch()
    if(message.channel.id != "757091932395798549") return
    message.channel.send(`${reaction.emoji} ${reaction.emoji.name}`)
    // todo: handle when the message is not partial
  }
}