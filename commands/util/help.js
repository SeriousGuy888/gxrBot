exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, fs, Discord, prefix} = index
  
  const replaceVars = str => {
    return str
      .replace(/%prefix%/gi, config.main.prefix)
      .replace(/%lowername%/gi, config.main.botNames.lowerCamelCase)
      .replace(/%uppername%/gi, config.main.botNames.upperCase)
      .replace(/%helpflags%/gi, `[${config.main.commands.help.flags.join(", ")}]`)
      .replace(/%webpanel%/gi, config.main.links.web_panel)
  }

  const readFile = name => {
    const { path } = config.help
    if(!fs.existsSync(`${path}${name}.txt`)) return `Error: File \`${name}\` does not exist.`
    const fileContents = fs.readFileSync(`${path}${name}.txt`, "utf8")
    
    return replaceVars(fileContents)
  }

  const noArgs = () => {
    const fields = {
      basic: [
        "`help` - (`h`) %lowername% help command",
        "`commands` - (`cmds`) Automatically generated list of all public commands",
        "`ping` - Get bot latency",
        "`web` - Get web panel link"
      ],
      fun: [
        "`billzo` - Know all the different editions of billzo.",
        "`google_translate` - (`gt`) Translate a phrase through several languages.",
        "`new_year_countdown` - (`2020`, `2021`, `new_year`) How many days until new year?"
      ],
      games: [
        "`coinflip` - Flip a coin.",
        "`hangman` - (`hoang`) Play hangman with %lowername% because %lowername% is very lonely.",
        "`magic8ball` - (`8ball`) Very accurate magic 8 ball.",
        "`rock_paper_scissors` - (`rps`) Play rock paper scissors against %lowername%."
      ],
      karma: [
        "`leaderboard` - (`lb`) See the karma leaderboard.",
        "`karma` - See someone's or your own karma score."
      ],
      admin: [
        "`auth` - For signing in to the admin web panel.",
        "`cult` - Set the cult channel.",
        "`mute` - Force mute and unmute everyone in a specified VC.",
        "`ows` - Set up the one word story channel."
      ]
    }

    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.help)
      .setDescription(`The prefix is ${prefix}.\nUse the prefix before a command name to use that command.`)
      .setTitle("Command List")
      .setFooter(`Use ${prefix}help info for info or somehting`)
    for(let fieldTitle in fields) {
      const content = replaceVars(fields[fieldTitle].join("\n"))
      emb.addField(fieldTitle.toUpperCase(), content)
    }

    message.channel.send(emb)
  }
  
  if(!args[0])
    noArgs()
  else
    message.channel.send(readFile(args[0]))
}

exports.help = async (client, message, args) => {
  message.channel.send("this is the ducking help command idot. oiasdlaskmlkn stupid just run it without arguments youian ")
}