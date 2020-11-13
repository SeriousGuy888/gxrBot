exports.run = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const settings = config.messageResponder

  if(message.author.bot)
    return
  if(!settings.enabled)
    return
  
  let response = ""
  let content = message.content

  for(let loopCase of settings.cases) {
    let passCondition = new RegExp(loopCase.conditions.pass.pattern, loopCase.conditions.pass.flags)
    let failCondition = new RegExp(loopCase.conditions.fail.pattern, loopCase.conditions.fail.flags)
    if(content.match(passCondition))
      if(loopCase.conditions.fail.pattern)
        if(!message.content.match(failCondition))
          response = loopCase.response
      else
        response = loopCase.response
  }

  if(response)
    message.channel.send(response)
}