module.exports = async (client, reaction, user) => {
  let message = reaction.message
  if(message.channel.id != "757091932395798549") return
  if(reaction.message.partial) message = await reaction.message.fetch()
  
  let a = reaction.count
  message.channel.send(`${a}`)
}