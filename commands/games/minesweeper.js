exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord, embedder } = index

  const columnCount = 12 // x
  const rowCount = 12 // y
  const totalMines = 12

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
          revealed: true,
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
      return

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
              fieldRows[x].push("⬛")
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
          else {
            fieldRows[x].push("🟦")
          }
        }
      }
    }

    for(let x = 0; x < fieldRows.length; x++) {
      fieldRows[x] = fieldRows[x].join("")
    }

    return fieldRows.join("\n")
  }

  const gameField = createField(columnCount, rowCount)

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle("Minesweeper")
    .setDescription(renderField(gameField))
    .addField("Mines", totalMines, true)
    .addField("Field Size", `${columnCount}x${rowCount}`, true)
  embedder.addAuthor(emb, message.author)

  message.channel.send(emb)
}