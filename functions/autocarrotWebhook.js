exports.run = (client, author, channel, content) => {
  const index = require("../index.js")
  const config = index.config

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
        let letterRatio = original.length / censor.length
  
        console.log(letterRatio)

        for(let j = 0; j < occurences[i].length; j++) {
          let c = censor.charAt(Math.floor(j * letterRatio))
          let p = occurences[i].charCodeAt(j)
  
          if(p >= 65 && p < 65 + 26)
            resWithPreservedCase += c.toUpperCase()
          else
            resWithPreservedCase += c.toLowerCase()
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
      "embeds": []
    }).catch(error => channel.send(error))
  }

  channel.fetchWebhooks().then(webhooks => {
    let foundHook = webhooks.find(w => w.name === hookName && w.owner.id === client.user.id)
    if(!foundHook) {
      channel.createWebhook(hookName, {
          avatar: hookAvatar,
          reason: "AutoCarrot"
        }).then(createdWebhook => {
          correctMsg(createdWebhook, content)
        })
    }
    else correctMsg(foundHook, content)
  })
}