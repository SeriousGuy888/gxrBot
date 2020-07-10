module.exports = (client, oldMessage, newMessage) => {
  const index = require("../index.js")

  let cultCache = index.cultCache
  let cultChannelId = cultCache.id.slice(2, cultCache.id.length - 1) // remove <# and > from channel mention to get id
  let cultPhrase = cultCache.word

  let owsCache = index.owsCache
  let owsChannelId = owsCache.id.slice(2, owsCache.id.length - 1) // remove <# and > from channel mention to get id

  switch(oldMessage.channel.id) {
    case cultChannelId:
      if(newMessage.content.toLowerCase() == cultPhrase || oldMessage.author.id == client.user.id) {
        return
      }
      else newMessage.delete().then(() => {
        if(newMessage.author.bot) {
          return
        }
        
        newMessage.channel.send(`<@${newMessage.author.id}>, editing your message to say \`${newMessage.content}\` is a violation of the cult rules.\nYou may only say \`${cultPhrase}\` here.`).then(msg => {
          msg.delete(3000) // delete message in 3 seconds
        }).catch(err => {
          console.log(err)
        })
      })
      break
    case owsChannelId:
      if(newMessage.content.split(" ").length == 1 || newMessage.author.id == client.user.id) {
        return
      }
  
      else newMessage.delete().then(() => {
        if(newMessage.author.bot) {
          return
        }
        
        newMessage.channel.send(`<@${message.author.id}>, this is the one word story channel. You are a stupid.`).then(msg => {
          msg.delete(3000) // delete message in 3 seconds
        }).catch(err => {})
      })
      break
    default:
      break
  }
}
