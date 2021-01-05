module.exports = {
  test: {
    emoji: ":duck:",
    description: "A developer item.",
    use: async userId => {
      const index = require("../../index.js")
      const { banker } = index

      banker.addToBalance(userId, 50)
      banker.addToInventory(userId, "test", -1)

      return "Added 50 to your balance."
    }
  }
}