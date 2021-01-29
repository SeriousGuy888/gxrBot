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
  twenty_twenty_one: {
    emoji: "<:2021:796514745837682688>",
    name: "2021 New Year Medal",
    description: "Was awarded to all users who were members of the Grade 9 League server at the start of 2021."
  },
  us_embassy_in_baghdad: {
    emoji: ":flag_us::homes::flag_iq: ",
    name: "American Embassy in the City of Baghdad",
    description: "A very useful item",
    givable: true,
    value: {
      buy: 250000000,
      sell: -1
    },
    use: async userId => {
      // const index = require("../../index.js")
      // const { banker } = index

      // banker.addToInventory(userId, "test", -1)

      return "Did nothing."
    }
  },
}