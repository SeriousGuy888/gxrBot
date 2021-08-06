exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord } = index
  const { messenger, cryptor } = client.util

  // https://lollyrock.com/posts/nodejs-encryption/
  // https://stackoverflow.com/questions/60369148/how-do-i-replace-deprecated-crypto-createcipher-in-node-js

  const userKey = cryptor.encrypt(message.author.id, args.join(" "))
  const emb = new Discord.MessageEmbed()
    .setColor("#edad01")
    .setTitle("Key")
    .setDescription("```" + userKey + "```")

  messenger.dm(message.author.id, emb, () => {
    message.channel.send("Check your DMs!")
  })
}

exports.disabled = "temp disabled during discord.js v13 update"