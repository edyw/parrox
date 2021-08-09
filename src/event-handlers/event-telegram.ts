import messaging from '../helpers/messaging'
import logger from '../helpers/logger'
import config from '../config'
import telegramSync from '../telegram-command/telegram-sync'
import { isGroupAdminOrOwner } from '../helpers/telegram-object'

const guildId = '872815108521353236'
const channelId = '872847144686583849'

const onText = async (ctx: any) => {
  try {
    if (ctx.message.text) {
      if (ctx.message.text.toLowerCase().startsWith(process.env.TELEGRAM_COMMAND_PREFIX) ||
          ctx.message.text.toLowerCase().startsWith(process.env.TELEGRAM_BOT_ID)) {
        const command = ctx.message.text.split(/\s+/)[1]
        const args = ctx.message.text.split(/\s+/).slice(2)
        if (!(/[0-9a-f]{8}/i).test(command)) return

        logger.verbose(`Telegram command: [${command}], args: [${args}], admin: ${await isGroupAdminOrOwner(ctx.update.message.chat.id, ctx.update.message.from.id)}`)
        await telegramSync(ctx, command, args)
        return
      }

      const syncRec = config.syncMap.groupId.get(ctx.update.message.chat.id)
      if (syncRec === undefined) return

      const message = `**${ctx.message.from.first_name}**: ${ctx.message.text}`
      messaging.discordSendMessage(syncRec.discord.guildId, syncRec.discord.channelId, message)
      logger.verbose(`[Text] Telegram(${syncRec.telegram.groupName}) -> Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}): ${message}`)
    }
  } catch (e) {
    logger.error('Failed processing telegram event on text. ', e)
    return null
  }
}

const onSticker = async (ctx: any) => {
  try {
    const syncRec = config.syncMap.groupId.get(ctx.update.message.chat.id)
    if (syncRec === undefined) return

    const message = `**${ctx.message.from.first_name}**: `
    const options = {
      content: message,
      files: [(await ctx.telegram.getFileLink(ctx.update.message.sticker.file_id)).href]
    }
    if (options.files[0].indexOf('.tgs') === -1) {
      messaging.discordSendMessage(syncRec.discord.guildId, syncRec.discord.channelId, options)
      logger.verbose(`[Sticker->Image] Telegram(${syncRec.telegram.groupName}) -> Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}): ${message}[file] ${options.files[0]}`)
    } else {
      messaging.discordSendMessage(syncRec.discord.guildId, syncRec.discord.channelId, `${message}${ctx.update.message.sticker.emoji}`)
      logger.verbose(`[Sticker->Emoji] Telegram(${syncRec.telegram.groupName}) -> Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}): ${message}${ctx.update.message.sticker.emoji}`)
    }
  } catch (e) {
    logger.error('Failed processing telegram event on sticker. ', e)
    return null
  }
}

const onPhoto = async (ctx: any) => {
  try {
    const syncRec = config.syncMap.groupId.get(ctx.update.message.chat.id)
    if (syncRec === undefined) return

    const _findLargestSizeFileId = (photos: any) => {
      let maxSize = 0, maxSizeFileId
      photos.forEach((photo: any) => {
        if (photo.file_size > maxSize) {
          maxSize = photo.file_size
          maxSizeFileId = photo.file_id 
        }
      })
      return maxSizeFileId
    }
    
    const message = `**${ctx.message.from.first_name}**: ${ctx.message.caption === undefined ? '' : ctx.message.caption}`
    const photoFileId = _findLargestSizeFileId(ctx.update.message.photo)
    const options = {
      content: message,
      files: [(await ctx.telegram.getFileLink(photoFileId)).href]
    }
    messaging.discordSendMessage(syncRec.discord.guildId, syncRec.discord.channelId, options)
    logger.verbose(`[Photo] Telegram(${syncRec.telegram.groupName}) -> Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}): ${message} [file] ${options.files[0]}`)
  } catch (e) {
    logger.error('Failed processing telegram event on photo. ', e)
    return null
  }
}

const onAnimation = async (ctx: any) => {
  try {
    const syncRec = config.syncMap.groupId.get(ctx.update.message.chat.id)
    if (syncRec === undefined) return

    const message = `**${ctx.message.from.first_name}**: `
    const options = {
      content: message,
      files: [(await ctx.telegram.getFileLink(ctx.update.message.animation.file_id)).href]
    }
    messaging.discordSendMessage(syncRec.discord.guildId, syncRec.discord.channelId, options)
    logger.verbose(`[Animation] Telegram(${syncRec.telegram.groupName}) -> Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}): ${message}[file] ${options.files[0]}`)
  } catch (e) {
    logger.error('Failed processing telegram event on animation. ', e)
    return null
  }
}

export default {
  onText,
  onSticker,
  onPhoto,
  onAnimation
}