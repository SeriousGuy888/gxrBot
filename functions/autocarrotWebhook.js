exports.run = (client, human, channel, content) => {
  // const index = require("../index.js")

  const hookName = "g9lBot AutoCarrot"
  const avatarURL = human.avatarURL.replace(/\s/g, "")
  const hookAvatar = client.user.avatarURL

  const swearCensors = require("../data/autocarrot/censored_words.json")
  const swearList = Object.keys(swearCensors)


  const correctMsg = (webhook, str) => {
    if(!str.trim()) return // if the message is empty

    let correctedMessage = str
    for(let loopSwear of swearList) {
      correctedMessage = correctedMessage.replace(new RegExp(loopSwear, "gi"), swearCensors[loopSwear])
    }


    let correctedMessageChunks = correctedMessage.match(/.{1,2000}/g)
    for(let loopChunk of correctedMessageChunks) {
      sendMsg(webhook, loopChunk)
    }
  }

  const sendMsg = (webhook, str) => {
    webhook.send(str, {
      "username": human.username,
      "avatarURL": avatarURL,
      "embeds": []
    }).catch(error => channel.send(error))
  }

  channel.fetchWebhooks().then(webhook => {
    let foundHook = webhook.find(webhook => webhook.name, hookName)
    if(!foundHook) {
      channel.createWebhook(hookName, hookAvatar).then(createdWebhook => correctMsg(createdWebhook, content))
    }
    else correctMsg(foundHook, content)
  })
}