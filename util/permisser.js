const index = require("../index.js")
const { Discord } = index

exports.hasPermission = (guildMember, permissionFlag) => {
  if(!(guildMember instanceof Discord.GuildMember))
    throw "Invalid GuildMember provided!"
  
  const permission = Discord.Permissions.FLAGS[permissionFlag.toUpperCase()]
  if(!permissionFlag)
    throw "Invalid permission name provided!"
  
  return guildMember.hasPermission(permission)
}