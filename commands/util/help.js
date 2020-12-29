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

    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.help)
      .setDescription(`The prefix is ${prefix}.\nUse the prefix before a command name to use that command.`)
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
        content += `\`${loopCommand.title}\` - ${loopCommand.content}`
      }
      
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