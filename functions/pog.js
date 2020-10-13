exports.run = (client, message) => { // super secret feature that will get removed as soon as people find out
  if(message.author.bot) return
  
  let shouldReply = false
  for(let loopPog of ["pog", "pogs", "pogger", "poggers"]) {
    for(let loopArg of args) {
      if(loopArg.toLowerCase() === loopPog) {
        shouldReply = true
      }
    }
  }

  if(shouldReply) {
    message.channel.send("pog")
  }
}