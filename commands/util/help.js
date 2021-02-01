exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, fs, Discord, prefix } = index
  
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
    const fields = require("../../config/help/pages/commands.json")
    let description = [
      `The prefix is \`${prefix}\`.`,
      "Use the prefix before a command name to use that command."
    ]

    if(config.main.guild.id !== message.guild.id) {
      description = [
        ...description,
        "",
        `:warning: Some features such as karma, one word story participation income, and the web panel may not work as intended outside the ${config.main.guild.name} Discord server. -billzo`
      ]
    }

    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.help)
      .setDescription(description.join("\n"))
      .setTitle("Command List")
      .setFooter(`Use ${prefix}help info for info or somehting`)
    for(const fieldTitle in fields) {
      const commandList = []
      for(const commandName in fields[fieldTitle]) {
        commandList.push({
          title: "`" + commandName + "`",
          content: replaceVars(fields[fieldTitle][commandName])
        })
      }

      let content = ""
      for(let loopCommand of commandList) {
        let commandContent = loopCommand.content
        let bulletPoint = "\\→"
        if(loopCommand.content.endsWith("+")) {
          bulletPoint = "\\⭐"
          commandContent = commandContent.substring(0, commandContent.length - 1)
        }


        content += `\n${bulletPoint}\`${loopCommand.title}\` - ${commandContent}`
      }
      
      emb.addField(fieldTitle.toUpperCase(), content, true)
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