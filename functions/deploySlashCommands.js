const config = require("../config/_config.js")
const settings = config.main

module.exports = async (client) => {
  const slashCommandData = [...client.scommands.values()]

  client.guilds.cache.get(settings.testGuildId)?.commands.set(slashCommandData)
    .then(() => console.log("🎉 Deployed slash commands to test server!"))
    .catch(err => console.error(`Error deploying slash commands to test server.\n`, err))
  client.application?.commands.set(slashCommandData)
    .then(() => console.log("🎉 Deployed slash commands globally!"))
    .catch(err => console.error(`Error deploying slash commands globally.\n`, err))
}