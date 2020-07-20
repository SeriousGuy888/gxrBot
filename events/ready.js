module.exports = (client, message) => {
  const index = require("../index.js")
  const prefix = index.prefix

  console.log("g9lBot Loaded!")

  const statuses = [
    `for ${prefix}help`,
    "Stolen InsomniCheez Code"
  ]

  setInterval(() => {
    client.user.setActivity(statuses[Math.floor(Math.random() * (statuses.length - 1) + 1)], { type: "WATCHING" })
  }, 10000)
}