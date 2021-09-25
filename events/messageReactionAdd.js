module.exports = async (client, reaction, user) => {
  const { karmanator } = client.util
  karmanator.countVote(reaction, user, false)
}