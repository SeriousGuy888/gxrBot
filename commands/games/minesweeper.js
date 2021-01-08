exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const minesweeperCache = index.gameCache.minesweeper
  const { config, Discord, embedder } = index

  const columnCount = 12 // x
  const rowCount = 12 // y
  const totalMines = 24

  const playerData = minesweeperCache[message.author.id]

  const create2dArray = (cols, rows) => {
    let arr = new Array(cols)
    for(let i = 0; i < rows; i++)
      arr[i] = new Array(rows)
    return arr
  }

  const placeMines = (field) => {
    var options = [] // allowed places for mines
    for(let x = 0; x < columnCount; x++) {
      for (let y = 0; y < rowCount; y++) {
        options.push([x, y])
      }
    }


    for(let loopMine = 0; loopMine < totalMines; loopMine++) {
      const choiceIndex = Math.floor(Math.random() * options.length)
      const choice = options[choiceIndex]

      if(!choice) { // if something goes wrong (like if there were 145 mines requested on a 12x12 field)
        continue // ignoring your problems makes them go away
      }

      options.splice(choiceIndex, 1) // do not allow another mine placed in the same location
      field[choice[0]][choice[1]].mine = true
    }

    return field
  }

  const setupField = (field) => {
    for(let x = 0; x < field.length; x++) {
      for(let y = 0; y < field.length; y++) {
        field[x][y] = {
          revealed: false,
          flagged: false,
        }
      }
    }

    field = placeMines(field)

    return field
  }

  const getNumberEmoji = num => {
    switch(num) {
      case 1:
        return ":one:"
      case 2:
        return ":two:"
      case 3:
        return ":three:"
      case 4:
        return ":four:"
      case 5:
        return ":five:"
      case 6:
        return ":six:"
      case 7:
        return ":seven:"
      case 8:
        return ":eight:"
    }
  }

  const checkAdjacentMines = (field, x, y) => {
    if(field[x][y].mine)
      return -1

    let mineCount = 0

    for(let xOffset = -1; xOffset <= 1; xOffset++) {
      if(!field[x + xOffset])
        continue
      for(let yOffset = -1; yOffset <= 1; yOffset++) {
        if(!field[x + xOffset][y + yOffset])
          continue
        if(xOffset === 0 && yOffset === 0)
          continue

        const loopSquare = field[x + xOffset][y + yOffset]
        if(loopSquare.mine)
          mineCount++
      }
    }

    return mineCount
  }

  const createField = (cols, rows) => {
    const field = create2dArray(cols, rows)
    const minedField = setupField(field)
    return minedField
  }

  const revealSquare = async (field, x, y) => {
    if((!field[x]) || (!field[x][y]))
      return -1
    
    field[x][y].revealed = true

    if(field[x][y].mine)
      playerData.failure = true

    if(!checkAdjacentMines(field, x, y)) {
      for(let xOffset = -1; xOffset <= 1; xOffset++) {
        for(let yOffset = -1; yOffset <= 1; yOffset++) {
          if(xOffset === 0 && yOffset === 0)
            continue
          if(
            (!field[x + xOffset]) ||
            (!field[x + xOffset][y + yOffset]) ||
            field[x + xOffset][y + yOffset].revealed
          ) continue

          revealSquare(field, x + xOffset, y + yOffset)
        }
      }
    }

    return field
  }

  const renderField = (field) => {
    let fieldRows = []

    for(let x = 0; x < field.length; x++) {
      for(let y = 0; y < field[x].length; y++) {
        if(!fieldRows[x])
          fieldRows[x] = new Array(field[x].length)
        
        const currentSquare = field[x][y]
        if(currentSquare.revealed) {
          if(currentSquare.mine) {
            fieldRows[x].push("💥")
          }
          else {
            const mineCount = checkAdjacentMines(field, x, y)
            if(mineCount === 0) {
              fieldRows[x].push(((x + 1) % 5 === 0 || (y + 1) % 5 === 0) ? "◾" : "⬛") 
            }
            else {
              fieldRows[x].push(getNumberEmoji(mineCount))
            }
          }
        }
        else {
          if(currentSquare.flagged) {
            fieldRows[x].push("🚩")
          }
          else { // if the square is not flagged
            fieldRows[x].push(((x + 1) % 5 === 0 || (y + 1) % 5 === 0) ? "🟧" : "🟨")
          }
        }
      }
    }

    for(let x = 0; x < fieldRows.length; x++) {
      fieldRows[x] = fieldRows[x].join("")
    }

    return fieldRows.join("\n")
  }

  const getFlagCount = (field) => {
    let flagCount = 0

    for(let x = 0; x < field.length; x++) {
      for(let y = 0; y < field[x].length; y++) {
        if(field[x][y].flagged)
          flagCount++
      }
    }
    
    return flagCount
  }

  const revealAllMines = async (field, flag) => {
    for(let x = 0; x < field.length; x++) {
      for(let y = 0; y < field[x].length; y++) {
        if(field[x][y].mine) {
          if(flag)
            field[x][y].flagged = true
          else
            field[x][y].revealed = true
        }
      }
    }
  }

  const checkGameOver = async (field) => {
    if(getFlagCount(field) > totalMines)
      return null
    
    if(playerData && playerData.failure)
      return { win: false }

    
    for(let x = 0; x < field.length; x++) {
      for(let y = 0; y < field[x].length; y++) {
        if(field[x][y].revealed) { // square is revealed
          if(field[x][y].mine) { // square is mine
            // await revealAllMines(field)
            // console.log("mine")
            return { win: false }
          }
        }
        else { // square is hidden
          if(!field[x][y].mine) { // square is safe
            // console.log("safe")
            return null // game is not finished
          }
        }
      }
    }

    return { win: true }
  }



  const tickMinesweeper = async (channel, options, init) => {
    let gameField, msg

    if(init)
      gameField = createField(columnCount, rowCount)
    else
      gameField = playerData.field

    if(options) {
      if(options.reveal) {
        const squareCoords = options.reveal
        await revealSquare(gameField, squareCoords[0], squareCoords[1])
        console.log(gameField[squareCoords[0]][squareCoords[1]])
      }
    }


    const gameOver = await checkGameOver(gameField)
    if(gameOver) {
      await revealAllMines(gameField, gameOver.win)
    }

    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle("Minesweeper but bad")
      .setDescription(renderField(gameField))
      .addField("Field Size", `${columnCount}x${rowCount}`, true)
      .addField("Flags Placed", `${getFlagCount(gameField)} / ${totalMines}`, true)
    embedder.addAuthor(emb, message.author)

    if(!gameOver) {
      if(init) {
        minesweeperCache[message.author.id] = {
          failure: false,
          message: await channel.send(emb),
          field: gameField,
        }
      }
      else {
        msg = playerData.message
        msg.edit(emb)
      }
    }
    else {
      msg = playerData.message

      emb.setColor(gameOver.win ? config.main.colours.success : config.main.colours.error)
      msg.edit(gameOver.win ? "You win!" : "You got blown up by a landmine D:", { embed: emb })

      delete minesweeperCache[message.author.id]
    }
  }

  if(!args[0])
    tickMinesweeper(message.channel, null, true)
  else {
    if((!playerData) || (!playerData.message)) {
      message.channel.send("you dont have an ongoing minesweeper game you dukc")
      return
    }

    let coords = args[0]
      .split(",") // quakc
      .splice(0, 2) // get first two coordinates
      .reverse() // coords are reversed and i dont know why but this fixes it probably
    coords = coords.map(elem => parseInt(elem) - 1)

    if(coords.length < 2) {
      message.channel.send("not enough dukcing coordinates you dukcing dukc")
      return
    }
    
    tickMinesweeper(message.channel, { reveal: coords })
  }
}