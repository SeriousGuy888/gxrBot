exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { guildPreferencer, embedder } = client.util
  
  const delay = ms => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2)
      }, ms)
    })
  }

  const changelogEmb = new Discord.MessageEmbed()
    .setColor("#dfa322")
    .setTitle("g9lBot Changelog")
    .setDescription("`-help` exists\nPsst! If you want to change where these changelogs are sent or disable the changelogs, ask a server admin to disable these.\n\n**Set to new channel:** `-config changelog_channel_id 1234123412341234`\n**Disable:** `-config changelog_channel_id`")
    .setFooter("Sincerely, Billzo the Slightly Unincompetent Programmer")
  embedder.addBlankField(changelogEmb)
    .addField(":1234::badger: Amazing Badge :badger::1234:", "The person who gets 10,000 in the g9l counting channel will receive a very shiny badge. `-badges`")
    .addField(":bar_chart: Added `-poll` Command", "Create polls that will generate a bar graph with the results when you close it. Doesn't reaally do much else.")
    .addField(":loudspeaker: Propaganda Updates", "Some new propaganda has been added.")
    .addField(":gear: New Config Settings", "Added settings `DISABLED_COMMANDS` and `ADMINS_BYPASS_DISABLED_COMMANDS`, which when enabled, will allow people with `Administrator` or `Manage Server` to admin abuse. Use `-config` to read their descriptions. Also the `-config` command is now paginated.")
    .addField(":bug: Bug Reports and Source Code", "You can find the links for bug reporting, my source code, and upcoming updates in the `-info` command. You can also make feature requests if you care.")
    .addField(":question: Help Command Updated", "New commands will be highlighted with a star emoji next to them I guess.")
  embedder.addBlankField(changelogEmb)
    .addField(":eyes: Upcoming", "- more things")

  if(message.author.id === config.admins.superadmin.id) {
    if(args[0]) {
      message.channel.send(changelogEmb)
    }
    else {
      for(const guildId in config.main.knownGuilds) {
        const prefs = await guildPreferencer.get(guildId)
        const changelogChannelId = prefs.changelog_channel_id
  
        const changelogChannel = await client.channels.fetch(changelogChannelId).catch(() => {})
        if(!changelogChannel) // channel not found
          continue
        if(changelogChannel.guild.id !== guildId) // channel is outside guild
          continue
        
  
        changelogChannel.send(changelogEmb)
        await delay(5000)
      }
    }
  }
}

exports.dev = true