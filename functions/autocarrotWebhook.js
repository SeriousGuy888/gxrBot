exports.run = (client, author, message) => {
  const index = require("../index.js")
  const config = index.config

  const channel = { message }
  const content = { message }

  const hookName = `${config.main.botNames.lowerCamelCase} AutoCarrot`
  const avatarURL = author.avatarURL()
  const hookAvatar = client.user.avatarURL()

  const swearCensors = config.autocarrot.words

  const randomElem = arr => arr[Math.floor(Math.random() * arr.length)]

  const correctMsg = (webhook, str) => {
    if(!str.trim()) return // if the message is empty

    // this function censors the regex filter provided and also keeps casing
    const censorWord = (original, filter, censor) => {
      let replacementResult = original
      let occurences = original.match(filter)
      for(let i in occurences) {
        let resWithPreservedCase = ""
        let letterRatio = occurences[i].length / censor.length
        for(let j = 0; j < censor.length; j++) {
          let censorChar = censor.charAt(j)
          let originalChar = occurences[i].charAt(Math.floor(j * letterRatio))
  
          if(originalChar.match(/[A-Z]/))
            resWithPreservedCase += censorChar.toUpperCase()
          else
            resWithPreservedCase += censorChar.toLowerCase()
        }
        replacementResult = replacementResult.replace(occurences[i], resWithPreservedCase)
      }
      return replacementResult
    }

    // uses filters as regexes
    let correctedMessage = str
    for(let loopSwear in swearCensors) {
      let filterRegex = new RegExp(loopSwear, "gi")
      if(typeof swearCensors[loopSwear] === "string") // if only one possible censor
        correctedMessage = censorWord(correctedMessage, filterRegex, swearCensors[loopSwear])
      else { // array of possible censors
        if(!swearCensors) // no censors defined
          continue
        if(config.autocarrot.settings.randomize.randomizeCensors)
          correctedMessage = censorWord(correctedMessage, filterRegex, randomElem(swearCensors[loopSwear]))
        else correctedMessage = censorWord(correctedMessage, filterRegex, swearCensors[loopSwear][0])
      }
    }


    let correctedMessageChunks = correctedMessage.match(/.{1,2000}/g)
    for(let loopChunk of correctedMessageChunks) {
      sendMsg(webhook, loopChunk)
    }
  }

  const sendMsg = (webhook, str) => {
    webhook.send(str, {
      "username": author.username,
      "avatarURL": avatarURL,
      "files": [...message.attachments.values()],
      "embeds": []
    }).catch(error => message.channel.send(error))
  }

  message.channel.fetchWebhooks().then(webhooks => {
    let foundHook = webhooks.find(w => w.name === hookName && w.owner.id === client.user.id)
    if(!foundHook) {
      message.channel.createWebhook(hookName, {
          avatar: hookAvatar,
          reason: "AutoCarrot"
        }).then(createdWebhook => {
          correctMsg(createdWebhook, content)
        })
    }
    else correctMsg(foundHook, content)
  })
}