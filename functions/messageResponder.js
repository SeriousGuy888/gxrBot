exports.run = (message) => {
  const index = require("../index.js")
  const { config } = index
  const settings = config.messageResponder

  if(message.author.bot)
    return
  if(!settings.enabled)
    return
  if(config.main.commands.blacklistedChannels.includes(message.channel.id))
    return
  
  let content = message.content

  for(let loopCase of settings.cases) {
    let passCondition = new RegExp(loopCase.conditions.pass.pattern, loopCase.conditions.pass.flags)
    let failCondition = new RegExp(loopCase.conditions.fail.pattern, loopCase.conditions.fail.flags)
    
    if(content.match(passCondition) && !message.content.match(failCondition))
      message.channel.send(loopCase.response)
  }
}