import 'dotenv/config'
import Discord from 'discord.js'

import messaging from '../helpers/messaging'
import logger from '../helpers/logger'
import { isGuildOwner } from '../helpers/discord-object'
import config from '../config'

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

      messaging.telegramSendMessage(syncRec.telegram.groupId, message.content) // TODO:
      logger.verbose(`[Message] Discord(${syncRec.discord.guildName}/${syncRec.discord.channelName}) -> Telegram(${syncRec.telegram.groupName}): ${message.content}`)
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