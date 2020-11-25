exports.run = (client) => {
  const index = require("../index.js")
  const config = index.config
  const settings = config.propaganda

  const channel = client.channels.cache.get(settings.channels[Math.floor(Math.random() * settings.channels.length + 1)])
  if(!channel)
    return console.log("The channel does not exist!")
  
  channel.join()
    .then(connection => {})
    .catch(e => console.log(e))
}