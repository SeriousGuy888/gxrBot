module.exports = (client, message) => {
  console.log("g9lBot Loaded!")

  client.user.setPresence({
    status: "idle",
    activity: {
      name: "Maintenence",
      type: "WATCHING"
    }
  })
}