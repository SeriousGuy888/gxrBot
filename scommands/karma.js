const index = require("../index.js")
const { client, config, Discord } = index
const { getUserArg, getEasterLink } = client.functions
const { karmanator, messenger } = client.util
const settings = config.karma

module.exports = {
  name: "karma",
  description: "Check a user's karma score",
  options: [
    {
      type: "USER",
      name: "user",
      description: "The user whose karma score you want to check."
    }
  ],
  execute: async (interaction, args) => {
    const [userArg] = args
    const user = userArg?.user || interaction.user

    const responseEmbed = new Discord.MessageEmbed()
      .setColor(settings.colours.karma)
      .setThumbnail(user.avatarURL({ dynamic: true }))
      .setTitle(`${user.tag}'s Karma`)
      .setURL(getEasterLink())
      .setFooter(settings.lang.footer)
  
  
    const karma = await karmanator.get(user.id) ?? 0
      
    const { positive, negative } = settings.leaderboard.emojis
    responseEmbed.setDescription([
      `[What is karma?](${config.main.links.github_pages}#faq-karma)`,
      `${karma > 0 ? positive : negative} ${karma.toLocaleString()}`,
      "",
      config.main.guild.id !== interaction.guild.id ? settings.lang.unavailableInGuild : ""
    ].join("\n"))
  
    interaction.followUp({ embeds: [responseEmbed] })
  }
}