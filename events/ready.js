module.exports = (client, message) => {
  const index = require("../index.js")
  const prefix = index.prefix

  console.log("g9lBot Loaded!")
  client.user.setActivity(`for ${prefix}help`, { type: "WATCHING" })
}