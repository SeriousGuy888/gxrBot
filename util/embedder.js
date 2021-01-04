const index = require("../index.js")
const Discord = index.Discord

exports.newEmbed = () => new Discord.MessageEmbed()
exports.addBlankField = (embed, inline) => embed.addField("\u200b", "\u200b", !!inline)
exports.addAuthor = (embed, user, authorText) => {
  return embed.setAuthor(
    authorText.replace(/%tag%/gi, user.tag) ?? user.tag,
    user.avatarURL({ dynamic: true })
  )
}