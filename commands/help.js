exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const fs = index.fs

  const noArgs = () => {
    const helpHome = readFile("help")
    message.channel.send(helpHome)
  }
  
  const readFile = name => {
    const { path } = config.help
    if(!fs.existsSync(`${path}${name}.txt`)) return `Error: File \`${name}\` does not exist.`
    const fileContents = fs.readFileSync(`${path}${name}.txt`, "utf8")
    const fixedContents = fileContents
      .replace(/%prefix%/gi, config.main.prefix)
      .replace(/%lowername%/gi, config.main.botNames.lowerCamelCase)
      .replace(/%uppername%/gi, config.main.botNames.upperCase)
    
    return fixedContents
  }
  
  if(!args[0]) noArgs()
  else message.channel.send(readFile(args[0]))
}