module.exports = async (client) => {
  const index = require("../index.js")
  const { config, googleTts, logger } = index
  const propagandaMessages = config.propaganda.messages
  const interviewItems = config.propaganda.interview
  const newsItems = config.propaganda.news
  const placeholders = config.propaganda.placeholders
  const settings = config.propaganda.settings

  const broadcast = client.voice.createBroadcast()
  const connections = []

  for(const channelId of Object.keys(settings.channels)) {
    const channel = await client.channels.cache.get(channelId)
    connections.push(await channel.join().catch(() => {}))
    logger.log(`Broadcasting propaganda to channel ${channelId}.`)
  }

  for(const connection of connections) {
    if(!connection)
      continue
    connection.play(broadcast)
    setInterval(() => {
      connection.play(broadcast)
    }, 1000 * 60 * 10)
  }


  let propagandaQueue = []

  const randArrElem = arr => arr[Math.floor(Math.random() * arr.length)]


  const fillPlaceholders = text => {
    for(let i = 0; i < 5; i++) {
      for(let j in placeholders) {
        text = text.replace(new RegExp(`%${j}%`, "i"), randArrElem(placeholders[j]))
      }
    }
    return text
  }


  const interview = () => {
    const { questions, answers } = interviewItems

    const question = fillPlaceholders(randArrElem(questions))
    const answer = fillPlaceholders(randArrElem(answers))
    
    propagandaQueue.push({
      message: question,
      language: settings.languages.host
    })
    propagandaQueue.push({
      message: answer,
      language: settings.languages.guest
    })
  }

  const news = () => {
    const { announcements, stories } = newsItems


    const announcement = fillPlaceholders(randArrElem(announcements))
    const story = fillPlaceholders(randArrElem(stories))
    propagandaQueue.push({
      message: `${announcement}, ${story}`,
      language: settings.languages.host
    })
  }


  const generatePropagandaQueue = async () => {
    for(let i = 0; i < 20; i++) {
      if(i === 0) {
        propagandaQueue = [
          ...propagandaQueue,
          {
            message: "This is the very cool propaganda show, with me, disembodied voice 1,",
            language: settings.languages.host
          },
          {
            message: "and me, disembodied voice 2.",
            language: settings.languages.guest
          },
          {
            message: "Please wait while you are indoctrinated.",
            language: settings.languages.host
          }
        ]
      }

      switch(Math.floor(Math.random() * 4)) {
        case 1:
          const line = {
            message: fillPlaceholders(randArrElem(propagandaMessages)),
            language: settings.languages.host
          }
          const line2 = {
            message: fillPlaceholders(randArrElem(interviewItems.yesNo)),
            language: settings.languages.guest
          }
  
          propagandaQueue.push(line)
          propagandaQueue.push(line2)
          break
        case 2:
          interview()
          break
        default:
          news()
          break
      }
    }

    if(settings.logNews) {
      logger.log(JSON.stringify(propagandaQueue))
    }
  }


  const playNewPropagandaMessage = async () => {
    let propagandaMessage = propagandaQueue[0]
    if(!propagandaMessage) {
      await generatePropagandaQueue()
      propagandaMessage = propagandaQueue[0]
    }
  
    const urls = await googleTts.getAllAudioUrls(propagandaMessage.message, {
      lang: propagandaMessage.language ?? settings.languages.default,
      splitPunct: ".!?"
    })
  
    const play = async piece => {
      if(!piece) {
        propagandaQueue.shift()
        setTimeout(() => {
          playNewPropagandaMessage()
        }, Math.round(Math.random() * 1000) + 500)
        return
      }
  
      const { url } = piece
      await broadcast.play(url)
        .on("finish", async () => {
          urls.shift()
          play(urls[0])
        })
        .on("error", async err => console.error)
    }
    await play(urls[0])
  }

  playNewPropagandaMessage()
}