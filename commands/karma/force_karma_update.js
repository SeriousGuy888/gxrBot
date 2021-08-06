exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const { karmanator } = client.util

  if(message.author.id === config.admins.superadmin.id) {
    message.reply({ content: "ok updating karma" })
    karmanator.update()
  }
}

exports.dev = true