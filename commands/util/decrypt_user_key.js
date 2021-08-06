exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord } = index
  const { messenger, cryptor } = client.util

  const input = args.shift()
  const customKey = args.join(" ")
  const decrypted = cryptor.decrypt(input, customKey)

  const emb = new Discord.MessageEmbed()
    .setColor("#edad01")
    .setTitle("Decrypted Key")
    .addField("Encrypted", "```" + input + "```")
    .addField("Decrypted", "```" + decrypted + "```")

  messenger.dm(message.author.id, emb, () => {
    message.channel.send("Check your DMs!")
  })
}

exports.disabled = "temp disabled during discord.js v13 update"