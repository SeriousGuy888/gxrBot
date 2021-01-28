const index = require("../index.js")
const { Discord } = index

exports.hasPermission = (guildMember, permissionFlag) => {
exports.hasPermission = (guildMember, permissionFlags, all) => {
  if(!(guildMember instanceof Discord.GuildMember))
    throw "Invalid GuildMember provided!"
  
  let permissionArr
  if(permissionFlags instanceof Array) // allow arrays
    permissionArr = permissionFlags
  else
    permissionArr = [permissionFlags] // and strings

  let permissionsAllowed = []
  for(const loopPermissionFlag of permissionArr) {
    const permission = Discord.Permissions.FLAGS[loopPermissionFlag.toUpperCase()]
    permissionsAllowed.push(guildMember.hasPermission(permission))
  }

  if(all)
    return permissionsAllowed.every(perm => perm) // every single one is true
  else
    return permissionsAllowed.some(perm => perm) // at least one is true
}
}