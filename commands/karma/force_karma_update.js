exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config

  if(message.author.id === config.admins.superadmin.id) {
    message.reply("ok updating karma")
    index.updateKarma()
  }
}

exports.dev = true