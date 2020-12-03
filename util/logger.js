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

exports.uploadLogs = (timestamps) => {
  const index = require("../index.js")
  const { client, config, fs } = index
  let { logs } = index

  const settings = config.logger

  const channel = client.channels.cache.get(settings.uploads.channel)
  if(!channel)
    return console.log("Error - Log file upload channel does not exist.")
  
  
  let combinedLogs = ""
  for(let loopLog of logs) {
    combinedLogs += `${timestamps ? loopLog.timestamp + " " : ""}${loopLog.text}`
  }
  let logParts = combinedLogs.match(new RegExp(`.{1,${settings.uploads.files.maxLength}}`, "gs"))

  for(let i in logParts) {
    const fileName = `${new Date().toISOString().replace(/:/g, "-")}_${i}.log`
    const filePath = `./temp/${fileName}`
  
    fs.writeFile(filePath, logParts[i], err => {
      if(err)
        return console.log(err)
      
      channel.send("", { files: [filePath] }) // upload log file
        .then(msg => { // then
          fs.unlink(filePath, () => {}) // delete file
        })
    })
  }

  logs = [] // clear any pending logs
}