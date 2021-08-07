
const index = require("../index.js")
const { client, config, Discord } = index
const { commander, badger, embedder } = client.util

module.exports = {
  name: "badges",
  description: "badges",
  options: [
    {
      type: "SUB_COMMAND",
      name: "list",
      description: "See a list of all possible badges",
    },
    {
      type: "SUB_COMMAND",
      name: "info",
      description: "See specific information about a specified badge",
      options: [
        {
          type: "STRING",
          name: "badge_name",
          description: "Name of the badge you want to lookup",
          required: true,
        }
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "user",
      description: "See a the badges a particular user has",
      options: [
        {
          type: "USER",
          name: "user",
          description: "The user whose badges you wish to view",
        }
      ],
    },
  ],
  defer: true,
  execute: async (interaction, options) => {
    const subcommand = options.getSubcommand()
    const badgeData = badger.badgeData()

    switch(subcommand) {
      case "list":
        const listEmb = new Discord.MessageEmbed()
          .setColor(config.main.colours.help)
          .setTitle("All Badges")
          .setDescription([
            "Here is a list of every available badge.",
            "Use command `/badges info <badge id>` to see a specific badge's info.",
            "Use command `/badges user [user]` to see what badges you or another user has.",
            `[What are badges?](${config.main.links.github_pages}#faq-badges)\n\u200b`
          ].join("\n"))
    
        await badger.paginateBadges(interaction, listEmb, Object.keys(badgeData), 1)
        break
      case "info":
        const [badgeNameArg] = subcommand.options
        const badgeName = badgeNameArg?.value?.toLowerCase()
        const badge = badgeData[badgeName]
        
        const infoEmb = new Discord.MessageEmbed()
          .setColor(config.main.colours.success)
          .setTitle(badgeName.toUpperCase())
    
        if(!badge) infoEmb.setDescription("Badge Not Found")
        else {
          infoEmb
            .setTitle((badge.emoji ? badge.emoji + " " : "") + badgeName.toUpperCase())
            .setDescription(badge.description || "No description provided.")
        }
    
        interaction.followUp({ embeds: [infoEmb] })
        break
      case "user":
        const [userArg] = subcommand?.options || []
        const user = userArg?.user || interaction.user
        const badges = await badger.getBadges(user.id)
        
        const userEmb = new Discord.MessageEmbed()
        embedder.addAuthor(userEmb, user, "%tag%'s Badges")
          .setTitle("User Badges")
          .setColor(config.main.colours.success)
      
        badger.paginateBadges(interaction, userEmb, badges, 1)
        break
    }
  }
}