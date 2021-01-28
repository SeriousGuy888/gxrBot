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
    .setFooter("Sincerely, Billzo the Sort of Competent Programmer")
  embedder.addBlankField(changelogEmb)
    .addField(":pray:", "Sorry if this thing did something really stupid. This is the first time I'm firing this new feature and I've tried to make it detect a default channel like #general or something but it might send it to like a random channel which is bad. You can reconfigure it if it did something wrong. -billzo")
  embedder.addBlankField(changelogEmb)
    .addField(":scroll: Added Changelogs", "Periodic broadcasts about new g9lbot features. You can opt out or change where these are sent.")
    .addField(":gear: Added `-config` Command", "This admin command allows you to configure things per server, such as where changelogs are sent and whether you want to enable Autocarrot.")
    .addField(":carrot: Autocarrot per Guild", "Autocarrot, which will replace some naughty words with what you really meant to say, can now be enabled separately for every Discord server. It is off by default, but an admin can enable this feature with the command `-config autocarrot_enabled true`.\n(You can still pause autocarrot for yourself if you don't want it, even on a server with it enabled. Just say `stop autocarroting me` somewhere that g9lBot can see it.)")
    .addField(":face_with_raised_eyebrow: `-profile` Command Updated", "The `-profile` or `-prof` command will now show what servers that have g9lBot the user is on, as well as their badges.")
  embedder.addBlankField(changelogEmb)
    .addField(":eyes: Upcoming", "- Updates to `-settings` command\n- More badges\n- Per server disabling of certain commands\n- More multi-server support")

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