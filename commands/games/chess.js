exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { gamePlayerData } = require("../../cache.js")
  const { config, Discord, Canvas, Chess, fs, path } = index
  const { embedder, gamer } = client.util



  const renderBoard = (state) => {
    const board = state.board()

    const width = 480
    const height = 480

    const squareSize = width / 8

    const canvas = Canvas.createCanvas(width, height)
    const ctx = canvas.getContext("2d")


    const colours = {
      squares: {
        dark: "#7C401E",
        light: "#E7C5A9"
      },
      pieces: {
        black: "#3a3a3a",
        white: "#e3e3e3"
      }
    }
    for(let x = 0; x < 8; x++) {
      for(let y = 0; y < 8; y++) {
        ctx.fillStyle = colours.squares.dark
        if((x + y) % 2 === 0) {
          ctx.fillStyle = colours.squares.light
        }

        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize)
      }
    }
    
    for(let x = 0; x < 8; x++) {
      for(let y = 0; y < 8; y++) {
        if(!board[x][y]) {
          continue
        }


        const pieceCol = board[x][y].color
        ctx.fillStyle = colours.pieces[pieceCol === "w" ? "white" : "black"]

        // i have no idea why x and y are flipped here
        const currentXPos = y * squareSize
        const currentYPos = x * squareSize


        const img = new Canvas.Image
        img.src = path.resolve("./assets/chess/pieces.png")

        const sourceImageSize = 60
        let sourcesX = ["q", "k", "r", "n", "b", "p"]
        let sourceX = sourcesX.indexOf(board[x][y].type)

        ctx.drawImage(img, sourceX * 60, pieceCol === "w" ? 60 : 0, sourceImageSize, sourceImageSize, currentXPos, currentYPos, squareSize, squareSize)
      }
    }


    const buf = canvas.toBuffer()
    const filePath = path.resolve(`./temp/chess-board_${Date.now()}.png`)
    fs.writeFileSync(filePath, buf)

    return filePath
  }

  const tick = async (channel, init) => {
    const playerData = gamePlayerData[message.author.id].data

    // if(!init && message.deletable) {
    //   message.delete()
    // }

    let flagsMessage = ""
    if(playerData.state) {
      if(playerData.state.inCheckmate()) {
        flagsMessage = ":hash: Checkmate!"
        gamer.clearGame(message.author.id)
      }
      else if(playerData.state.inCheck()) {
        flagsMessage = ":gun: Check!"
      }
      else if(
        playerData.state.inStalemate() ||
        playerData.state.inDraw() ||
        playerData.state.inThreefoldRepetition()
      ) {
        flagsMessage = ":heavy_division_sign: Draw!"
        gamer.clearGame(message.author.id)
      }
    }

    const attachment = new Discord.MessageAttachment(renderBoard(playerData.state), "board.png")
    let embed = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(`**__${config.main.botNames.lowerCamelCase} Chess__**`)
      .attachFiles(attachment)
      .setImage("attachment://board.png")
      .setDescription([
        `**Turn:** ${playerData.state.turn() === "w" ? "WHITE" : "BLACK"}`,
        flagsMessage,
        "",
        "Type your move!",
        "*Accepted formats:* SAN: \`Nf3\`, Smith: \`g1f3\`"
      ].join("\n"))
    embedder.addBlankField(embed)
      .setFooter(`Want to resign? ${config.main.prefix}quit_game`)
    embedder.addAuthor(embed, message.author)

    


    let msg
    if(playerData.message?.deletable) {
      playerData.message.delete()
    }
    msg = await channel.send(embed)
    playerData.message = msg


    if(playerData.failure) {
      gamer.clearGame(message.author.id)
      await msg.edit(`You lose!`)
    }
  }

  switch(args[0]) {
    case "play":
      if(gamer.isPlaying(message.author.id)) {
        message.reply(`You are already playing another of my games! To prevent everything from breaking, you will need to quit this game first. Use command \`quit_game\`.`)
        return
      }

      gamer.createGame(message.author.id, "chess", {
        state: new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
        failure: false,
        message: null
      })

      tick(message.channel, true)
      break
    case "panel":
      if(gamer.isPlaying(message.author.id, "chess")) {
        return message.reply(`You are not currently playing chess!`)
      }

      let oldMsg = gamePlayerData[message.author.id].data.message
      let oldMsgEmbed = new Discord.MessageEmbed()
        .setColor(config.main.colours.error)
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setTitle(`**__${config.main.botNames.lowerCamelCase} Chesdfss__**`)
        .setDescription("The player has requested a new gamesfd panel.")
      tick(message.channel, true)
      oldMsg.edit(oldMsgEmbed)
      break
    case "move":
      const playerData = gamePlayerData[message.author.id].data

      let moveStr = args[1]
      const move = playerData.state.move(moveStr, { sloppy: true })
      if(!move) {
        const newMove = playerData.state.move(moveStr.charAt(0).toUpperCase() + moveStr.slice(1).toLowerCase(), { sloppy: true })
        if(newMove) {
          tick(message.channel)
        }
        else {
          message.channel.send("Illegal move!")
        }
      }
      else {
        tick(message.channel)
      }
      break
    case "forfeit":
    case "quit":
      client
        .commands
        .get("quit_game")
        .run(client, message, [])
      break
    case "help":
      this.help(client, message, args)
      break
    default:
      this.help(client, message, args)
      break
  }
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { commandHelpEmbed } = index
  const config = index.config
  const { settings } = config.hangman

  const embed = commandHelpEmbed(message, {
    title: "**Chezz**",
    description: "Play a game of chezz!",
    syntax: `${config.main.prefix}hsfdf`,
    example: [
      `**Plsdfgdfgs**`,
      ` ${config.main.prefix}hangdfggman psdfsdfay`,
    ].join("\n"),
  })
  
  message.channel.send(embed)
}