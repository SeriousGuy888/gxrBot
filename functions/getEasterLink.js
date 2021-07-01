// easter egg urls hidden in the hyperlinks used for blue text
// i wonder which one you will get

const links = [
  "https://youtu.be/dQw4w9WgXcQ",         // 🤔
  "https://youtu.be/MtN1YnoL46Q",         // duck song
  "https://youtu.be/-3WuQxnA7Hg",         // sheet music
  "https://youtu.be/Wu8mhzQe5tM",         // danger levels
  "https://youtu.be/bw7ZZokxV-w",         // soviet anthem on electric toothbrushes
  "https://youtu.be/aB5Eqo9-gfU",         // dams
  "https://youtu.be/PUB0TaZ7bhA",         // trigonometry
  "https://youtu.be/IdoD2147Fik",         // dumbledore
  "https://youtu.be/IFe9wiDfb0E",         // life, ruined by lawyers
  "https://youtu.be/gYpQLLy8TY4",         // is this the krusty krab in 24 languages
  "https://youtu.be/wEt8fWWPGvA",         // we have technology in 24 languages
  "https://youtu.be/cmpg-qiPYa8",         // vscode code prettifier
  "https://youtu.be/QMNGEY8OZqo",         // 24 hours of death part 1
  "http://howdovaccinescauseautism.com/", // try reading the link
  "http://endless.horse/",                // horse?
]

module.exports = () => {
  return links[Math.floor(Math.random() * links.length)]
}