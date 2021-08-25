import logger from './logger'
import config from '../config'

const discordSendMessage = (guildId: string, channelId: string, text: any) => {
  try {
    const guild = config.discord.guilds.cache.find(guild => guild.id === guildId)
    if (guild !== undefined) {
      const channel = guild.channels.cache.find(channel => channel.id === channelId)
      const textChannel: any = guild.channels.resolve(channel!)
      textChannel.send(text).catch((e: Error) => {
        console.log('[messaging.discordSendMessage] Error: ', e)
        return null
      })
    }
  } catch (e) {
    logger.error('Failed sending message to discord. ', e)
    return null
  }
}

const telegramSendMessage = (groupId: number, text: string) => {
  try {
    config.telegram.telegram.sendMessage(groupId, text, { parse_mode: 'MarkdownV2' }).catch(e => {
      console.log('[messaging.telegramSendMessage] Error: ', e)
      return null
    })
  } catch (e) {
    logger.error('Failed sending message to telegram. ', e)
    return null
  }
}

export default {
  discordSendMessage,
  telegramSendMessage
}
