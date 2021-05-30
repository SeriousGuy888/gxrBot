const index = require("../index.js")
const { stringSimilarity } = index

module.exports = (similarTo, stringArr) => {
  const sortedBySimilarity = stringSimilarity.findBestMatch(similarTo, stringArr).ratings
  sortedBySimilarity.sort((a, b) => {
    if(a.rating < b.rating)
      return 1
    if(a.rating > b.rating)
      return -1
    return 0
  })

  return sortedBySimilarity
}