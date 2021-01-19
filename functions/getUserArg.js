module.exports = async (message) => {
  const index = require("../index.js")
  const { extractArgs } = index

  const { args } = extractArgs(message)
  
  let user
  if(!args[0])
    user = message.author
  else
    user = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => {})
  
  if(!user)
    user = message.author
  if(user.user)
    user = user.user
  
  return user
}