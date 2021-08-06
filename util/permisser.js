const index = require("../index.js")
const { client, config, Discord } = index
const { embedder } = client.util

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
    permissionsAllowed.push(guildMember.permissions.has(permission))
  }

  if(all)
    return permissionsAllowed.every(perm => perm) // every single one is true
  else
    return permissionsAllowed.some(perm => perm) // at least one is true
}

exports.permissionEmbed = async (guildMember, permissionFlags, all, channel) => {
  if(!this.hasPermission(guildMember, permissionFlags, all)) {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.error)
      .setTitle("Insufficient Permissions")
      .setDescription(`You may not use this command as you do not have **${all ? "all" : "at least one"}** of the permissions ${permissionFlags.map(e => `\`${e}\``).join(", ")}.`)
      .setFooter("Is this a mistake? Contact server admins.")
    embedder.addAuthor(emb, guildMember.user)
    await channel.send(emb)
    return false
  }
  else
    return true
}