exports.run = (client, message) => { // super secret feature that will get removed as soon as people find out
  if(message.author.bot) return
  
  let shouldReply = false
  pogLoop:
    for(let loopPog of ["pog", "pogs", "pogger", "poggers"]) {
      for(let loopArg of message.split(" ")) {
        if(loopArg.toLowerCase() === loopPog) {
          shouldReply = true
          break pogLoop
        }
      }
    }

  if(shouldReply) {
    message.channel.send("pog")
  }
}