module.exports = {
  test: {
    emoji: ":duck:",
    name: "Test Item",
    description: "A developer item.",
    givable: true,
    value: {
      buy: 666666666,
    },
    use: async userId => {
      const index = require("../../index.js")
      const { banker } = index

      banker.addToInventory(userId, "test", -1)

      return "Item consumed. Did nothing."
    }
  },
  kindergarten_diploma: {
    emoji: ":scroll:",
    name: "Kindergarten Diploma",
    description: "Awarded for very cool achievements in the counting channel.\n`This item is currently not obtainable.`"
  },
  twenty_twenty_one: {
    emoji: "<:2021:796514745837682688>",
    name: "2021 New Year Medal",
    description: "Was awarded to all users who were members of the discord server at the start of 2021."
  }
}