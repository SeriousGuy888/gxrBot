exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config

  if(message.author.id === config.admins.superadmin.id && args[0] === "zmxncbv") {
    message.reply("ok")
    client.destroy()
  }
}