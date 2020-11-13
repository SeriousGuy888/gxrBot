exports.run = (client, message) => { // super secret feature that will get removed as soon as people find out
  if(message.author.bot) return
  
  let response = ""

  if(message.content.match(/pog/gi) && !message.content.match(/(un|not )(pog)/gi))
    response = "pog"
  if(message.content.match(/i'?m (lonely|sad)/gi))
    response = "D: don't be"

  if(response)
    message.channel.send(response)
}