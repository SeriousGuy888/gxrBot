exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord, auth } = index
  const { messenger } = client.util

  auth.createCustomToken(message.author.id)
    .then(customToken => {
      const emb = new Discord.MessageEmbed()
        .setColor("#efef23")
        .setTitle(`:key: Web Panel Token for User ${message.author.id}`)
        .setDescription([
          `Your token is \`\`\`${customToken}\`\`\``,
          `Paste into the [web panel admin login](${config.main.links.web_panel_admin}) to authenticate with your Discord ID.`
        ].join("\n"))
        .setFooter("Do not share this with anyone.")

      messenger.dm(message.author.id, emb, () => message.channel.send("Check your DMs!"))
    })
    .catch(err => {
      message.channel.send(`Error while minting token: ${err}`)
    })
}

exports.help = async (client, message, args) => {
  message.channel.send("gives you an auth token for the web panel")
}

exports.disabled = "oeuf"