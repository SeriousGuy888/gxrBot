module.exports = async (client) => {
  const index = require("../index.js")
  const { config, googleTts, logger } = index
  const propagandaMessages = config.propaganda.messages
  const interviewItems = config.propaganda.interview

  const channel = await client.channels.cache.get("430565803293933582")
  if(!channel) {
    logger.log("Propaganda channel does not exist!")
    return
  }

  const connection = await channel.join()


  const propagandaQueue = []

  const randArrElem = arr => arr[Math.floor(Math.random() * arr.length)]

  const interview = () => {
    const { questions, answers } = interviewItems
    const { quality, events, things } = interviewItems.placeholders

    const placeholders = text => text
      .replace(/%quality%/gi, randArrElem(quality))
      .replace(/%event%/gi, randArrElem(events))
      .replace(/%thing%/gi, randArrElem(things))

    const question = placeholders(randArrElem(questions))
    const answer = placeholders(randArrElem(answers))
    
    propagandaQueue.push({
      message: question,
      language: "en-CA"
    })
    propagandaQueue.push({
      message: answer,
      language: "en-GB"
    })
  }

  const generatePropagandaQueue = async () => {
    for(let i = 0; i < 5; i++) {
      if(Math.round(Math.random())) {
        interview()
      }
      else {
        const line = {
          message: randArrElem(propagandaMessages),
          language: "en-CA"
        }
        const line2 = {
          message: randArrElem(interviewItems.yesNo),
          language: "en-GB"
        }

        propagandaQueue.push(line)
        propagandaQueue.push(line2)
      }
    }

    console.log(propagandaQueue)
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