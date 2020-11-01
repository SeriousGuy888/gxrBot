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

    // uses filters as regexes
    let correctedMessage = str
    for(let loopSwear in swearCensors) {
      let filterRegex = new RegExp(loopSwear, "gi")
      if(typeof swearCensors[loopSwear] === "string") // if only one possible censor
        correctedMessage = correctedMessage.replace(filterRegex, swearCensors[loopSwear])
      else { // array of possible censors
        if(!swearCensors) // no censors defined
          continue
        if(config.autocarrot.settings.randomize.randomizeCensors)
          correctedMessage = correctedMessage.replace(filterRegex, randomElem(swearCensors[loopSwear]))
        else correctedMessage = correctedMessage.replace(filterRegex, swearCensors[loopSwear][0])
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