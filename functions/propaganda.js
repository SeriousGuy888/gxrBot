exports.run = async (client) => {
  return

  const index = require("../index.js")
  const { client, config, fs } = index
  const settings = config.propaganda

  const channel = client.channels.cache.get(settings.channels[Math.floor(Math.random() * settings.channels.length)])
  if(!channel)
    return console.log("The channel does not exist!")
  
  const connection = await channel.join()


  // const dispatcher = connection.play("../assets/propaganda/beeep.ogg")
  const dispatcher = connection.play(fs.createReadStream("./assets/propaganda/beeep.ogg"), {
    type: "ogg/opus",
  })
  dispatcher.on("start", () => {
    console.log("playing!")
  })
  dispatcher.on("end", end => {
    channel.leave()
  })
}