exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  
  let commandListMessage = [
    "**Public Command List**",
    "`This list does not include disabled commands or dev commands or their aliases.`",
    "`cmd_a → cmd_b means that cmd_a is an alias of cmd_b`",
    "\n"
  ].join("\n")
  for(let loopCommandName of client.publicCommandList) {
    let isAlias = false
    let redirCmdName
    if(client.commands.get(loopCommandName).alias) {
      isAlias = true
      redirCmdName = client.commands.get(loopCommandName).alias
      if(client.commands.get(redirCmdName).disabled || client.commands.get(redirCmdName).dev)
        continue
    }
    commandListMessage += `\n• ${loopCommandName}${isAlias ? " → `" + redirCmdName + "`" : ""}`
  }
  commandListMessage += "\n\n:warning: *This list is automatically compiled. For a list with detailed info and that is actively maintained, use command `-help cmds`*"

  for(let loopChunk of commandListMessage.match(/.{1,2000}/gs))
    message.channel.send(loopChunk)
}