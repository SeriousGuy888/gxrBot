exports.run = (client, human, channel, content) => {
  // const index = require("../index.js")

  const hookName = "g9lBot AutoCarrot"
  const avatarURL = human.avatarURL.replace(/\s/g, "")
  const hookAvatar = client.user.avatarURL

  const swearCensors = require("../data/autocarrot/censored_words.json")
  const swearList = Object.keys(swearCensors)


  function sendMsg(webhook) {
    if(!content.trim()) return // if the message is empty

    let correctedMessage = content
    for(i in swearList) correctedMessage = correctedMessage.replace(new RegExp(swearList[i], "gi"), swearCensors[swearList[i]])

    webhook.send(correctedMessage, {
      "username": human.username,
      "avatarURL": avatarURL,
      "embeds": []
    }).catch(error => channel.send(error))
  }

  channel.fetchWebhooks().then(webhook => {
    let foundHook = webhook.find(webhook => webhook.name, hookName)
    if(!foundHook) {
      channel.createWebhook(hookName, hookAvatar).then(webhook => {
        sendMsg(webhook)
      })
    }
    else sendMsg(foundHook)
  })
}