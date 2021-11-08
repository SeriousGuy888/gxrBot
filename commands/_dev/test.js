
exports.run = async (client, message, args) => {
  const { messenger } = client.util
  const { Discord } = require("../..")
  const emb = new Discord.MessageEmbed()
    .setTitle("fasfdguck")
  messenger.dm(message.author.id, { content: "a", embeds: [emb] })
}

exports.dev = true