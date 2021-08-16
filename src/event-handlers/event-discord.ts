import 'dotenv/config'
import Discord from 'discord.js'

import messaging from '../helpers/messaging'
import logger from '../helpers/logger'
import { isGuildOwner } from '../helpers/discord-object'
import config from '../config'


const _isMention = (arg: any) => {
	return arg.startsWith('<@') && arg.endsWith('>')
}

const _getMentionedUserNickname = (message: any, mention: any) => {
	mention = mention.slice(2, -1);
	if (mention.startsWith('!')) {
		mention = mention.slice(1);
	}

	let member
	if(!message.guild.members.cache){
		member = message.guild.members.fetch(mention)
	}
	else{
		member = message.guild.members.cache.get(mention)
	}
	return member
}

const _addEscapeToSpecialCharacter = (messageContent: string) => {
	messageContent = messageContent.replace(/((\_|\*|\[|\]|\(|\)|\~|\`|\>|\#|\+|\-|\=|\||\{|\}|\.|\!){1})/g, '\\$1')
	return messageContent
}

const _getFormattedMessageForTelegram = (message: any) => {
	const _isAttachment = (messageAttachment: any) => {
		return messageAttachment.first()
	}

	let messageContent
  if (_isAttachment(message.attachments)) {
		messageContent = message.attachments.first().url
  } else {
    messageContent = message.content
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

const onMessageCreate = async (message: Discord.Message) => {
  try {
    if (message.content.toLowerCase().startsWith(process.env.DISCORD_COMMAND_PREFIX!)) {
      const command = message.content.split(/\s+/)[1]
      const args = message.content.split(/\s+/).slice(2)
      if (!config.discord.commands.has(command)) return

      logger.verbose(`Discord command: [${command}], args: [${args}], owner: ${isGuildOwner(message)}`)
      config.discord.commands.get(command).execute(message, args)
      return
    }

    if (!message.author.bot) {
      const syncRec = config.syncMap.channelId.get(message.channelId)
      if (syncRec === undefined) return

      const messageContent = _getFormattedMessageForTelegram(message)
      const username = _addEscapeToSpecialCharacter(message.member!.displayName)
      const msg = `*${username}*: ${messageContent}`
      messaging.telegramSendMessage(syncRec.telegram.groupId, msg) // TODO:
      logger.verbose(`[Message] Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}) -> Telegram(${syncRec.telegram.groupName}): ${msg}`)
    }
  } catch (e) {
    logger.error('Failed processing discord event on messageCreate. ', e)
    return null
  }
}

export default {
  onInteractionCreate,
  onMessageCreate
}