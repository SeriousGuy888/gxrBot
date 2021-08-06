const config = require("../config/_config.js")
const settings = config.main

module.exports = async (client) => {
  const slashCommandData = [
    {
      name: "ping",
      description: "Replies with Pong!",
    },
    {
      name: "echo",
      description: "Plagiaraises your message",
      options: [
        {
          name: "content",
          type: "STRING",
          description: "What to echo back",
          required: true
        }
      ]
    }
  ]

  await client.guilds.cache.get(settings.testGuildId)?.commands.set(slashCommandData)
    .catch(err => console.error(`Error deploying slash commands to test server.`, err))
  await client.application?.commands.set(slashCommandData)
    .catch(err => console.error(`Error deploying slash commands globally.`, err))

  console.log("🎉 Deployed Slash Commands!")
}