const index = require("../index.js")
const { client, config, Discord, firebaseAdmin, db } = index
const badgeData = config.badges
let { badgeQueue } = index
const { arrayRemove, arrayUnion } = firebaseAdmin.firestore.FieldValue
const { MessageActionRow, MessageButton } = Discord


exports.getBadges = async userId => {
  const userRef = db.collection("users").doc(userId)
  const doc = await userRef.get()

  let badges = new Set()

  if(doc.exists) {
    let data = doc.data()

    if(data.badges) // if database record for user's badges exists
      badges = new Set(data.badges) // read record and use as badges
  }

  if(!badgeQueue[userId])
    badgeQueue[userId] = {}

  for(const badge of Object.keys(badgeQueue[userId])) {
    if(badgeQueue[userId][badge].remove)
      badges.delete(badge)
    else
      badges.add(badge)
  }

  return [...badges].sort() // cast set to array and sort
}

exports.addBadge = async (userId, badge, remove) => {
  const { logger } = client.util

  if(!badgeQueue[userId])
    badgeQueue[userId] = {}

  badgeQueue[userId][badge] = { remove }

  logger.log(`${remove ? "Removed" : "Granted"} badge \`${badge}\` ${remove ? "from" : "to"} user ${userId}.`)
}

exports.awardBadge = async (userId, badge, remove, reason) => {
  const { messenger, preferencer, embedder } = client.util

  if(!remove && (await this.getBadges(userId)).includes(badge)) {
    return
  }

  await this.addBadge(userId, badge, remove)

  const notifPrefs = (await preferencer.get(userId)).notifications ?? true
  if(!remove && notifPrefs) {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle("Badge Awarded")
      .setDescription([
        `You have been awarded a badge for reason \`${reason ?? "no reason provided"}\`, which is quite cool.`,
        `You can check what badges you have with \`${config.main.prefix}mybadges\`.`
      ].join("\n"))
    embedder.addBlankField(emb)
      .addField((badgeData[badge]?.emoji + " " ?? "") + badge?.toUpperCase(), badgeData[badge]?.description ?? "No description provided.")
    embedder.addBlankField(emb)
      .addField("\u200b", `*PS: You can disable these notifications by disabling the corresponding setting with the command \`${config.main.prefix}settings\`.*`)

    messenger.dm(userId, emb)
  }
}


exports.updateBadges = async () => {
  const { logger } = client.util

  if(Object.keys(badgeQueue).length === 0)
    return
  
  logger.log(`Updating user badges...`)
  logger.log(JSON.stringify(badgeQueue, null, 4))

  const batch = db.batch()

  for(let user in badgeQueue) {
    if(!Object.keys(badgeQueue[user]).length) {
      delete badgeQueue[user]
      continue
    }

    let toAdd = []
    let toRemove = []
    for(const i in badgeQueue[user]) {
      if(badgeQueue[user][i].remove)
        toRemove.push(i)
      else
        toAdd.push(i)
    }

    const docRef = db.collection("users").doc(user)
    if(toAdd.length)
      batch.update(docRef, "badges", arrayUnion(...toAdd))
    if(toRemove.length)
      batch.update(docRef, "badges", arrayRemove(...toRemove))

    delete badgeQueue[user]
  }
  
  await batch.commit()
}

exports.paginateBadges = async (interaction, embed, badges, page) => {
  const { messenger } = client.util


  let maxPages
  const badgeEmbed = async (currentPage, disableButtons) => {
    embed.fields = []

    const itemsPerPage = 6
    const startAt = (currentPage - 1) * itemsPerPage
    const endAt = startAt + itemsPerPage
    maxPages = Math.ceil(badges.length / itemsPerPage)


    for(var i = startAt; i < endAt; i++) {
      const badge = badges[i]
      if(!badge)
        break

      const badgeInfo = badgeData[badge]
      const badgeDesc = badgeInfo?.description || "No description"
      const badgeEmoji = badgeInfo?.emoji ?? ""

      embed.addField(`${badgeEmoji} ${badge.toUpperCase()}`, badgeDesc, true)
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("first")
        .setLabel("<<")
        .setStyle("SECONDARY")
        .setDisabled(page <= 1),
      new MessageButton()
        .setCustomId("prev")
        .setLabel("<")
        .setStyle("SECONDARY")
        .setDisabled(page <= 1),
      new MessageButton()
        .setCustomId("curr")
        .setLabel(`Page ${page} of ${maxPages}`)
        .setStyle("PRIMARY")
        .setDisabled(true),
      new MessageButton()
        .setCustomId("next")
        .setLabel(">")
        .setStyle("SECONDARY")
        .setDisabled(page >= maxPages),
      new MessageButton()
        .setCustomId("last")
        .setLabel(">>")
        .setStyle("SECONDARY")
        .setDisabled(page >= maxPages),
    )
    if(disableButtons) row.components.map(comp => comp.setDisabled(true))

    return { embeds: [embed], components: [row] }
  }
  

  const msgData = await badgeEmbed(page)
  const msg = await interaction.followUp(msgData)

  const filter = (inter) => {
    if(inter.user.id === interaction.user.id) return true
    else {
      inter.reply({
        content: `Only ${interaction.user.toString()} is allowed to use this button.`,
        ephemeral: true
      }).catch(() => {})
      return false
    }
  }

  const collector = msg.createMessageComponentCollector({ filter, time: 60000 })
    .on("collect", async (inter) => {
      collector.resetTimer()

      const buttonId = inter.customId
      switch(buttonId) {
        case "first":
          page = 1
          break
        case "prev":
          page--
          break
        case "next":
          page++
          break
        case "last":
          page = maxPages
          break
      }

      page = Math.max(Math.min(maxPages, page), 1)

      inter.deferUpdate().catch(() => {})
      let newMsgData = await badgeEmbed(page)
      msg.edit(newMsgData)
    })
    .on("end", async () => {
      let newMsgData = await badgeEmbed(page, true)
      msg.edit(newMsgData)
    })
}

exports.badgeData = () => badgeData