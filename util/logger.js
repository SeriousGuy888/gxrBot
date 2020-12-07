const index = require("../index.js")
const { client, config, fs } = index
let { logs } = client

const settings = config.logger

exports.log = (line, source) => {
  console.log(line)

  if(!logs.ready)
    this.setup()


  const { sourceLength } = settings.lines
  let sourceStr
  if(!source)
    source = "not specified"
  sourceStr = source
    .replace(/ /g, "_")
    .slice(0, sourceLength)
    .padStart(sourceLength, " ")
  const totalLine = `[${new Date().toISOString()} | ${sourceStr}]: ${line}`

  
  fs.access(logs.file.path, err => {
    if(!err) { // if file exists
      const fileInfo = fs.statSync(logs.file.path)
      if(fileInfo.size + totalLine.length >= settings.uploads.files.maxSize)
        this.uploadLogs("Automatic upload to stay under file size limit.", true)
    }
  })
  
  logs.stream.write(totalLine + "\n")
}

exports.setup = () => {
  logs.file = {}
  logs.file.name = `${config.main.botNames.lowerCamelCase}-logs-v3_${new Date().toISOString().replace(/:/g, "-")}.log`
  logs.file.path = `./temp/${logs.file.name}`

  logs.stream = fs.createWriteStream(logs.file.path, { flags: "a" })
  
  logs.ready = true

  logs.stream.write("logs")
}

exports.uploadLogs = async (reason, createNewFile) => {
  const channel = client.channels.cache.get(settings.uploads.channel)
  if(!channel)
    return console.log("Log file upload channel does not exist.")
  
  if(!logs.ready)
    this.setup()
  
  if(!logs.file.name || !logs.file.path)
    return console.log("Logger util log file was not specified.")
  
  
  fs.access(logs.file.path, err => {
    if(err) { // if file does not exist
      console.log("Logger util failed to find file as it does not exist.")
      this.setup()
    }
    
    channel.send(`---\n\n**Log Upload**\nReason: ${reason}`, { files: [logs.file.path] }) // upload log file
      .then(() => {
        fs.unlink(logs.file.path, () => { // delete file
          if(createNewFile)
            this.setup()
        })
      })
      .catch(e => channel.send(`Error uploading logs: ${e}`))
  })
}