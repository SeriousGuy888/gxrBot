exports.run = (client, human, channel, content) => {
  // const index = require("../index.js")

  let hookName = "g9lBot AutoCarrot"
  let msgAvatar = human.avatarURL
  let hookAvatar = client.user.avatarURL

  // if(!human)    return channel.send("err 12")
  // if(!channel)  return channel.send("err 13")
  // if(!content)  return channel.send("err 14")
  // if(!avatarURL) avatarURL = msgAvatar

  avatarURL = msgAvatar.replace(/\s/g, "")

  function sendMsg(webhook) {
    webhook.send(content, {
      "username": human.username,
      "avatarURL": avatarURL,
      "embeds": []
    })
    .catch(error => channel.send(error))
  }

  channel.fetchWebhooks()
    .then(webhook => {
      let foundHook = webhook.find(webhook => webhook.
        name, hookName)

      if(!foundHook) {
        channel.createWebhook(hookName, hookAvatar)
          .then(webhook => sendMsg(webhook))
      }
      else sendMsg(foundHook)
    }
  )
}