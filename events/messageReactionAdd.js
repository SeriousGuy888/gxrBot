module.exports = (client, reaction, user) => {
  const { message } = reaction
  if(message.channel.id != "757091932395798549") return
  message.channel.send(reaction.emoji)
}