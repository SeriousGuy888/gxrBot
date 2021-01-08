exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord, embedder } = index

  const columnCount = 5 // x
  const rowCount = 5 // y

  const create2dArray = (cols, rows) => {
    let arr = new Array(cols)
    for(let i = 0; i < rows; i++)
      arr[i] = new Array(rows)
    return arr
  }

  const placeMines = (field) => {
    for(let x = 0; x < field.length; x++) {
      for(let y = 0; y < field.length; y++) {
        field[x][y] = !!Math.round(Math.random())
      }
    }

    return field
  }

  const createField = (cols, rows) => {
    const field = create2dArray(cols, rows)
    const minedField = placeMines(field)
    return field
  }

  const grid = createField(columnCount, rowCount)

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle("minesweeper")
    .setDescription("```json\n" + JSON.stringify(grid, null, 4) + "```")
  embedder.addAuthor(emb, message.author)

  message.channel.send(emb)
}