module.exports = async (client) => {
  const index = require("../index.js")
  const { config, googleTts, logger } = index
  const propagandaMessages = config.propaganda.messages
  const interviewItems = config.propaganda.interview
  const newsItems = config.propaganda.news
  const placeholders = config.propaganda.placeholders

  const channel = await client.channels.cache.get("430565803293933582")
  if(!channel) {
    logger.log("Propaganda channel does not exist!")
    return
  }

  const connection = await channel.join()


  let propagandaQueue = []

  const randArrElem = arr => arr[Math.floor(Math.random() * arr.length)]


  const fillPlaceholders = text => {
    for(const i in placeholders) {
      text = text.replace(new RegExp(`%${i}%`, "gi"), randArrElem(placeholders[i]))
    }
    return text
  }


  const interview = () => {
    const { questions, answers } = interviewItems

    const question = fillPlaceholders(randArrElem(questions))
    const answer = fillPlaceholders(randArrElem(answers))
    
    propagandaQueue.push({
      message: question,
      language: "en-CA"
    })
    propagandaQueue.push({
      message: answer,
      language: "en-GB"
    })
  }

  const news = () => {
    const { announcements, stories } = newsItems


    const announcement = fillPlaceholders(randArrElem(announcements))
    const story = fillPlaceholders(randArrElem(stories))
    propagandaQueue.push({
      message: `${announcement}: ${story}`,
      language: "en-CA"
    })
  }


  const generatePropagandaQueue = async () => {
    for(let i = 0; i < 20; i++) {
      if(i === 0) {
        propagandaQueue = [
          ...propagandaQueue,
          {
            message: "This is the Grade 9 League's propaganda show, with me, the Canadian voice,",
            language: "en-CA"
          },
          {
            message: "and me, the British voice.",
            language: "en-GB"
          },
          {
            message: "Please wait while you are indoctrinated.",
            language: "en-CA"
          }
        ]
      }

      switch(Math.floor(Math.random() * 3)) {
        case 1:
          interview()
          break
        case 2:
          news()
          break
        default:
          const line = {
            message: fillPlaceholders(randArrElem(propagandaMessages)),
            language: "en-CA"
          }
          const line2 = {
            message: fillPlaceholders(randArrElem(interviewItems.yesNo)),
            language: "en-GB"
          }
  
          propagandaQueue.push(line)
          propagandaQueue.push(line2)
          break
      }
    }

    logger.log(JSON.stringify(propagandaQueue))
  }


  const playNewPropagandaMessage = async () => {
    let propagandaMessage = propagandaQueue[0]
    if(!propagandaMessage) {
      await generatePropagandaQueue()
      propagandaMessage = propagandaQueue[0]
    }
  
    const urls = await googleTts.getAllAudioUrls(propagandaMessage.message, { lang: propagandaMessage.language ?? "en-CA" })
  
    const play = async piece => {
      if(!piece) {
        propagandaQueue.shift()
        setTimeout(() => {
          playNewPropagandaMessage()
        }, Math.round(Math.random() * 1000) + 500)
        return
      }
  
      const { url } = piece
      await connection.play(url)
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