module.exports = (author, message) => {
  const index = require("../index.js")
  const { client, config } = index
  const { logger } = client.util
  const { preserveCaseReplace } = client.functions

  
  const searchHookName = `${config.main.botNames.lowerCamelCase} AutoCarrot`
  const hookName = `${config.main.botNames.lowerCamelCase} AutoCarrot #${message.channel.id}`
  const avatarURL = author.avatarURL()
  const hookAvatar = client.user.avatarURL()

  const swearCensors = config.autocarrot.words
  const randomElem = arr => arr[Math.floor(Math.random() * arr.length)]
  
  const correctMsg = (webhook, str) => {
    if(!str.trim()) return // if the message is empty
    

    let correctedMessage = str
    for(let loopSwear in swearCensors) { // loop through all keys in swear censors
      const searchRegex = new RegExp(loopSwear, "gi") // make a regex pattern from the key
      correctedMessage = correctedMessage.replace(searchRegex, matched => {
          let replaceWith
        
          if(typeof swearCensors[loopSwear] === "string") { // if only one possible censor
            replaceWith = swearCensors[loopSwear]
          }
          else {
            if(config.autocarrot.settings.randomize.randomizeCensors) {
              replaceWith = randomElem(swearCensors[loopSwear])
            }
            else {
              replaceWith = swearCensors[loopSwear][0]
            }
          }
    
          return preserveCaseReplace(matched, replaceWith)
      })
    }


    let correctedMessageChunks = correctedMessage.match(/(.|\n){1,2000}/g)
    for(let loopChunk of correctedMessageChunks) {
      sendMsg(webhook, loopChunk)
    }

    const logSantization = s => s.replace(/\n/g, " || ")
    const logOriginalContent = logSantization(message.content)
    const logCorrectedContent = logSantization(correctedMessage)
    logger.log(`Corrected M ${message.id} of U ${author.id} from \`${logOriginalContent}\` to \`${logCorrectedContent}\`.`)
  }

  const sendMsg = (webhook, str) => {
    webhook.send(str, {
      "username": author.username,
      "avatarURL": avatarURL,
      "files": message.attachments.array(),
      "embeds": []
    }).catch(error => message.channel.send(error))

    
    if(config.autocarrot.settings.deleteOriginalMessage)
      message.delete()
  }

  message.channel.fetchWebhooks()
    .then(webhooks => {
      let foundHook = webhooks.find(w => w.name.includes(searchHookName) && w.owner.id === client.user.id)
      if(!foundHook) {
        message.channel.createWebhook(hookName, {
          avatar: hookAvatar,
          reason: "AutoCarrot"
        }).then(createdWebhook => {
          logger.log(`Created autocarrot webhook W ${createdWebhook.id} in C ${message.channel.id}.`)
          correctMsg(createdWebhook, message.content)
        })
      }
      else {
        if(foundHook.name !== hookName || foundHook.avatarURL() !== hookAvatar)
          foundHook.edit({ name: hookName, avatar: hookAvatar, reason: "Updated legacy autocarrot webhook" })
        correctMsg(foundHook, message.content)
      }
    })
}