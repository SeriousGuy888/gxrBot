const index = require("../index.js")
const Discord = index.Discord

exports.newEmbed = () => new Discord.MessageEmbed()
exports.addBlankField = (embed, inline) => embed.addField("\u200b", "\u200b", !!inline)