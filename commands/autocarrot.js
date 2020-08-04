exports.run = async (client, message, args) => {
  const index = require("../index.js")

  const swearCensors = require("../data/autocarrot/censored_words.json")
  const swearList = Object.keys(swearCensors)


  const autocarrotWebhook = index.autocarrotWebhook
  
  var newMsg = args.join(" ")
  
  for(i in swearList) {
    newMsg = newMsg.replace(new RegExp(swearList[i], "gi"), swearCensors[swearList[i]])
  }
  
  autocarrotWebhook(message.author, message.channel, newMsg)
  message.delete()
}