module.exports = (message) => {
  const index = require("../index.js")
  const { client, config, banker } = index
  const { messenger, badger, statTracker } = client.util

  const legal = () => [...message.attachments.values()].length === 0

  const cultLegal = (content, phrase) => {
    const liamCult = () => {
      const permutations = []

      const letters = phrase.split("")
      const permCount = 1 << phrase.length
      
      for(let perm = 0; perm < permCount; perm++) {
        letters.reduce((currentPerm, letter, i) => {
          letters[i] = (currentPerm & 1) ? letter.toUpperCase() : letter.toLowerCase()
          return currentPerm >> 1
        }, perm)
      
        const result = letters.join("")
        permutations.push(result)
      }

      messenger.dm("427925505581383721", permutations[Math.floor(Math.random() * permutations.length)])
    }

    content = content.toLowerCase()
    phrase = phrase.toLowerCase()
    if(content === phrase && legal()) {
      if(message.author.id !== "427925505581383721") liamCult()
      return true
    }
  }
  const owsLegal = content => {
    content = content.toLowerCase().replace(/[^a-z ]/gi, "")
    if(content.split(" ").length > 1)
      return false
    return legal()
  }

  if(message.author.id === client.user.id)
    return

  switch(message.channel.id) {
    case config.coopchannels.cult.channel:
      if(cultLegal(message.content, config.coopchannels.cult.phrase)) {
        statTracker.add(message.author.id, "coop_cult", 1)
        return
      }
      this.punish(message, "cult", [
        config.coopchannels.cult.phrase,
        message.content
      ])
      break
    case config.coopchannels.ows.channel:
      if(owsLegal(message.content)) {
        // random amount of money between 0 and 0.1
        banker.addToBalance(message.author.id, parseFloat((Math.random() * 0.1).toFixed(2)))
        badger.awardBadge(message.author.id, "storyteller", false, "contributing to the one word story")
        statTracker.add(message.author.id, "coop_ows", 1)
        return
      }
      this.punish(message, "ows")
      break
    case config.coopchannels.counting.channel:
      break
  }
}

exports.deleteMessage = (message, errorMessage) => {
  const index = require("../index.js")
  const { client } = index
  const messenger = client.util.messenger

  if(!message.author.bot)
    messenger.dm(message.author.id, errorMessage)

  setTimeout(() => message.delete(), 500)
}

exports.punish = (message, mode, placeholders) => {
  if(!message || !mode) throw Error("Specify message and mode to penalize.")
  
  let scoldingMessage = "co-op error0"
  switch(mode) {
    case "cult":
      if(!placeholders) {
        scoldingMessage = "co-op error1"
        break
      }
      scoldingMessage = `Hey, so you seem to have misspelled \`${placeholders[0]}\`. Don't worry, \`${placeholders[1]}\` is a very common misspelling (definitely). I've gone ahead and nuked your message. Try to be a better ~~cult~~ ~~league~~ republic member next time.`
      break
    case "ows":
      scoldingMessage = `Your contribution to the one word story may only **be one word** and you **may not have attachments**.`
      break
    default:
      scoldingMessage = "co-op error2"
      break
  }
  
  this.deleteMessage(message, scoldingMessage)
}
