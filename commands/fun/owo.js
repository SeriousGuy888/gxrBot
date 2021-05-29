exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { preserveCaseReplace } = client.functions

  if(!args[0]) return

  const filters = {
    "o": "owo",
    "u": "uwu",
    "r": "w",
  }

  const originalContent = args.join(" ")
  let newContent = originalContent

  const searchRegex = new RegExp(Object.keys(filters).join("|"), "gi")
  newContent = newContent.replace(searchRegex, matched => {
    return preserveCaseReplace(matched, filters[matched.toLowerCase()])
  })

  message.channel.send(newContent)
}