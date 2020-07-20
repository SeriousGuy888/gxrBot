module.exports = (client, message) => {
  const index = require("../index.js")
  const prefix = index.prefix

  console.log("g9lBot Loaded!")

  const statuses = [
    `for ${prefix}help`,
    "Hi, I'm InsomniCheez Lite!"
  ]

  setInterval(() => {
    const index = Math.floor(Math.random() * (activities_list.length - 1) + 1)
    client.user.setActivity(activities_list[index], { type: "WATCHING" })
  }, 10000)
}