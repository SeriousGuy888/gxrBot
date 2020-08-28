module.exports = (client, message) => {
  const index = require("../index.js")

  console.log("g9lBot Loaded!")

  client.user.setPresence({
    status: "online",
    activity: {
      name: `for ${index.prefix}help`,
      type: "WATCHING"
    }
  })
}