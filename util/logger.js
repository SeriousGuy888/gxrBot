exports.log = (logLine, noConsoleLog, options) => {
  const index = require("../index.js")
  const { config } = index
  let { logs } = index

  const settings = config.logger

  logs.push({
    text: logLine,
    timestamp: new Date()
  })

  if(!noConsoleLog)
    console.log(logLine)
}

exports.uploadLogs = async (dontPrintTimestamps) => {
  console.log("logger.uploadLogs() called")

  const index = require("../index.js")
  const { client, config, fs } = index
  let { logs } = index

  const settings = config.logger

  const channel = client.channels.cache.get(settings.uploads.channel)
  if(!channel)
    return console.log("Error - Log file upload channel does not exist.")
  


  const nCharStringSplit = (source, segmentLength) => {
    if (!segmentLength || segmentLength < 1)
      throw Error("Invalid segment length")
    const target = []
    for(
      const array = Array.from(source);
      array.length;
      target.push(array.splice(0, segmentLength).join(""))
    );
    return target
  }

  
  console.log("p2")
  let combinedLogs = ""
  for(let loopLog of logs) {
    if(!dontPrintTimestamps)
      combinedLogs += `[${loopLog.timestamp.toISOString()}]: `
    combinedLogs += `${loopLog.text}`
    combinedLogs += "\n"
  }
  let logParts = nCharStringSplit(combinedLogs, settings.uploads.files.maxLength)

  for(let i in logParts) {
    const fileName = `${config.main.botNames.lowerCamelCase}-logs_${new Date().toISOString().replace(/:/g, "-")}_${i}.log`
    const filePath = `./temp/${fileName}`

    let caption = ""
    if(i === 0)
      caption = "-----\n**Log Uploads**"
  
    fs.writeFile(filePath, logParts[i], err => {
      if(err)
        return console.log(err)
      
      channel.send(caption, { files: [filePath] }) // upload log file
        .then(msg => { // then
          fs.unlink(filePath, () => {}) // delete file
        })
    })
  }

  logs.splice(0, logs.length) // clear any pending logs
}