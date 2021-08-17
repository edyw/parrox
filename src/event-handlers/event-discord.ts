import 'dotenv/config'
import Discord from 'discord.js'

import messaging from '../helpers/messaging'
import logger from '../helpers/logger'
import { isGuildOwner } from '../helpers/discord-object'
import config from '../config'

const _addEscapeToSpecialCharacter = (messageContent: string) => {
	messageContent = messageContent.replace(/((\_|\*|\[|\]|\(|\)|\~|\`|\>|\#|\+|\-|\=|\||\{|\}|\.|\!){1})/g, '\\$1')
	return messageContent
}

const _getFormattedMessageForTelegram = (discordMsg: any): string => {
	const _isAttachment = (messageAttachment: any) => {
		return messageAttachment.first()
  }
  
	let messageContent = ''
  if (discordMsg.cleanContent !== undefined)
    messageContent = discordMsg.cleanContent + '\n'

  if (_isAttachment(discordMsg.attachments)) {
		messageContent += discordMsg.attachments.first().url
  }
  return _addEscapeToSpecialCharacter(messageContent)
}

const onInteractionCreate = (interaction: Discord.Interaction) => {
  try {
    logger.verbose('Discord interaction -> Telegram: ' + interaction)
  } catch (e) {
    logger.error('Failed processing discord event on interactionCreate. ', e)
    return null
  }
}

const onMessageCreate = async (discordMsg: Discord.Message) => {
  try {
    if (discordMsg.content.toLowerCase().startsWith(process.env.DISCORD_COMMAND_PREFIX!)) {
      const command = discordMsg.content.split(/\s+/)[1]
      const args = discordMsg.content.split(/\s+/).slice(2)
      if (!config.discord.commands.has(command)) return

      logger.verbose(`Discord command: [${command}], args: [${args}], owner: ${isGuildOwner(discordMsg)}`)
      config.discord.commands.get(command).execute(discordMsg, args)
      return
    }

    if (!discordMsg.author.bot) {
      if (!discordMsg.content) return
      const syncRec = config.syncMap.channelId.get(discordMsg.channelId)
      if (syncRec === undefined) return

      const messageContent = _getFormattedMessageForTelegram(discordMsg)
      const username = _addEscapeToSpecialCharacter(discordMsg.member!.displayName)
      const msg = `*${username}*: ${messageContent}`
      messaging.telegramSendMessage(syncRec.telegram.groupId, msg) 
      logger.verbose(`[Message] Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}) -> Telegram(${syncRec.telegram.groupName}): ${msg}`)
    }
  } catch (e) {
    logger.error('Failed processing discord event on messageCreate. ', e)
    return null
  }
}

const onMessageUpdate = async (
  discordOldMsg: Discord.Message | Discord.PartialMessage,
  discordNewMsg: Discord.Message | Discord.PartialMessage
) => {
  try {
    if (discordNewMsg === null) return
    if (!discordNewMsg.author!.bot) {
      const syncRec = config.syncMap.channelId.get(discordNewMsg.channelId)
      if (syncRec === undefined) return

      const messageContent = _getFormattedMessageForTelegram(discordNewMsg)
      let username = (discordNewMsg.pinned) ? discordNewMsg.member!.displayName + ' pinned [Discord]' : discordNewMsg.member!.displayName + ' edited'
      username = _addEscapeToSpecialCharacter(username)
      
      const msg = `*${username}*: ${messageContent}`
      messaging.telegramSendMessage(syncRec.telegram.groupId, msg) 
      logger.verbose(`[Message] Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}) -> Telegram(${syncRec.telegram.groupName}): ${msg}`)
    }
  } catch (e) {
    logger.error('Failed processing discord event on messageUpdate. ', e)
    return null
  }
}

export default {
  onInteractionCreate,
  onMessageCreate,
  onMessageUpdate
}