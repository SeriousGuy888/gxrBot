module.exports = (client, oldMessage, newMessage) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix

  const db = index.db

  let cultCache = index.cultCache
  let cultChannelId = cultCache.id.slice(2, cultCache.id.length - 1) // remove <# and > from channel mention to get id
  let cultPhrase = cultCache.word

  let owsCache = index.owsCache
  let owsChannelId = owsCache.id.slice(2, owsCache.id.length - 1) // remove <# and > from channel mention to get id

  
  if(oldMessage.channel.id === cultChannelId) {
    function messageLegal(msg, phrase) {
      if(!msg || !phrase) return console.log("error with cult code in messageUpdate.js event")

      msg = msg.toLowerCase()
      phrase = phrase.toLowerCase()

      if(msg == phrase) return true
    }

    if(messageLegal(newMessage.content, cultPhrase) || newMessage.author.id == client.user.id) {
      return
    }
    else newMessage.delete().then(() => {
      if(newMessage.author.bot) {
        return
      }
      
      newMessage.channel.send(`<@${message.author.id}>, editing your message to say \`${message.content}\` is a violation of the cult rules.\nYou may only say \`${cultPhrase}\` here.`).then(msg => {
        msg.delete(3000) // delete message in 3 seconds
      }).catch(err => {})
    })
  }
  if(oldMessage.channel.id === owsChannelId) {
    function messageLegal(msg) {
      if(!msg) return console.log("error with ows code in messageUpdate.js event")

      msg = msg.toLowerCase().replace(/[^a-z ]/gi, "")
      
      if(msg.split(" ").length == 1) return true
      else return false
    }

    if(messageLegal(newMessage.content) || newMessage.author.id == client.user.id) {
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
  }
}
