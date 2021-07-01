// easter egg urls hidden in the hyperlinks used for blue text
// i wonder which one you will get

const links = [
  "https://youtu.be/dQw4w9WgXcQ",
  "https://youtu.be/MtN1YnoL46Q",
  "https://youtu.be/-3WuQxnA7Hg",
  "https://youtu.be/Wu8mhzQe5tM",
  "https://youtu.be/bw7ZZokxV-w",
  "https://youtu.be/aB5Eqo9-gfU",
]

module.exports = () => {
  return links[Math.floor(Math.random() * links.length)]
}