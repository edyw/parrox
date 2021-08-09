
import collectionSync from '../database/collection-sync'
import { isGroupAdminOrOwner } from '../helpers/telegram-object'
import logger from '../helpers/logger'
import config from '../config'
import messaging from '../helpers/messaging'

const telegramSync = async (ctx: any, command: string, args: string[]) => {
  try {
    const linkId = command
    const userId = ctx.update.message.from.id
    const userFirstName = ctx.update.message.from.first_name
    const groupId = ctx.update.message.chat.id
    const groupName = ctx.update.message.chat.title

    const isUserAdmin = await isGroupAdminOrOwner(groupId, userId)
    if (!isUserAdmin) {
      ctx.reply('You have to be Admin to sync group chat.')
      logger.info(`Discord <-> Telegram: Failed syncing ${groupId}(${groupName}) using linkId: ${linkId}. ${userId} is not an Admin.`)
      return
    }
    const existingRecs = await collectionSync.queryByGroupId(groupId)
    if (existingRecs.length !== 0) {
      let isExistingLinked = false
      existingRecs.forEach(existingRec => {
        if (existingRec.isLinked) isExistingLinked = true          
      })
      if (isExistingLinked) {
        ctx.reply(`This chat is already synced a Discord channel.`)
        logger.info(`Discord <-> Telegram: Failed syncing ${groupId}(${groupName}) using linkId: ${linkId}. Group ID already synced to a Discord channel.`)
        return
      }
    }

    const syncResult = await collectionSync.queryByLinkId(linkId)
    if (syncResult !== undefined) {
      if (!syncResult.isLinked && !syncResult.isEnabled) {
        await collectionSync.updateGroup(linkId, groupId, groupName, userId, userFirstName)
        config.reloadSyncMap()
        ctx.reply(`${groupName} is now synced to Discord: ${syncResult.discord.guildName}, Channel: ${syncResult.discord.channelName}`)
        messaging.discordSendMessage(syncResult.discord.guildId, syncResult.discord.channelId, '```' + `${syncResult.discord.channelName} is now synced to Telegram: ${groupName}` + '```')
        logger.info(`Discord <-> Telegram: Success syncing ${syncResult.discord.guildId}(${syncResult.discord.guildName}) ${syncResult.discord.channelId}(${syncResult.discord.channelName}) <-> ${groupId}(${groupName})`)
      }
    }
  } catch (e) {
    logger.error('Failed processing telegram group to collection sync. ', e)
  return false
  }
}

export default telegramSync
