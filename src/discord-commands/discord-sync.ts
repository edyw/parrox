import Discord from 'discord.js'
import { isGuildOwner, getGuildChannel } from '../helpers/discord-object'
import { generateLinkId } from '../helpers/id'
import collectionSync from '../database/collection-sync'
import config from '../config'
import logger from '../helpers/logger'

interface Channel {
  guildId: string,
  guildName: string,
  channelId: string,
  channelName: string,
  authorId: string,
  authorUsername: string
}

const helpMessage = `
parrox sync [param]

  [blank]   status or request new sync
  enable    enable sync (default)
  disable   temporarily disable sync
  remove    permanently remove sync

`

const _requestSync = async (ch: Channel): Promise<string> => {
  try {
    let response = ''
    let linkId = ''

    const syncResult = await collectionSync.queryByChannel(ch.guildId, ch.channelId)
    if (syncResult.length === 0) {
      linkId = generateLinkId()
      await collectionSync.upsertLinkId(ch.guildId, ch.guildName, ch.channelId, ch.channelName, ch.authorId, ch.authorUsername, linkId)
      logger.info(`Discord command [sync] Inserted new channel sync ${ch.guildName}/${ch.channelName} with linkId: ${linkId}`)
      response += `Sync Channel: ${ch.channelName}\n\n`
      response += `Next steps:\n 1. In Telegram group, invite:\n    @parroxbot\n\n 2. In Telegram group chat, type:\n\n    parrox ${linkId}\n\n`
    } else {
      const isLinked = syncResult[0].isLinked
      const isEnabled = syncResult[0].isEnabled

      if (!isLinked) {
        linkId = syncResult[0].linkId
        response += `Sync Channel: ${ch.channelName}\n\n`
        response += `Next steps:\n 1. In Telegram group, invite:\n    @parroxbot\n\n 2. In Telegram group chat, type:\n\n    parrox ${linkId}\n\n`
      } else if (!isEnabled) {
        response += `Channel is linked to Telegram:\n  ${syncResult[0].telegram.groupName}\n\nSync status: Disabled.\n\nType: parrox sync enable, to re-enable the sync.`
      } else {
        response += `Channel is linked to Telegram:\n  ${syncResult[0].telegram.groupName}\n\nSync status: Enabled.`
      }
    }
    return response
  } catch(e){
    console.error('Discord command [sync._requestSync] Error: ', e)
    return 'Ops.. something wrong when processing sync request.'
  }
}

const _enableSync = async (ch: Channel): Promise<string> => {
  try {
    let response = 'Channel must be linked to Telegram and disabled status.'
    const syncRecs = await collectionSync.queryByChannel(ch.guildId, ch.channelId)
    if (syncRecs.length !== 0) {
      if (!syncRecs[0].isEnabled && syncRecs[0].isLinked) {
        const updateStatus = await collectionSync.updateIsEnabled(ch.guildId, ch.channelId, true)
        if (updateStatus) {
          config.reloadSyncMap()
          logger.info(`Discord <-> Telegram: ${syncRecs[0].discord.guildId}(${syncRecs[0].discord.guildName}) ${syncRecs[0].discord.channelId}(${syncRecs[0].discord.channelName}) <-> ${syncRecs[0].telegram.groupId}(${syncRecs[0].telegram.groupName}) is Enabled.`)
           response = 'Channel sync to Telegram is enabled.'
        }
      } 
    } 
    return response
  } catch(e){
    console.error('Discord command [sync._enableSync] Error: ', e)
    return 'Ops.. something wrong when enabling sync.'
  }
}

const _disableSync = async (ch: Channel): Promise<string> => {
  try {
    let response = 'Channel must be linked to Telegram and enabled status.'
    const syncRecs = await collectionSync.queryByChannel(ch.guildId, ch.channelId)
    if (syncRecs.length !== 0) {
      if (syncRecs[0].isEnabled && syncRecs[0].isLinked) {
        const updateStatus = await collectionSync.updateIsEnabled(ch.guildId, ch.channelId, false)
        if (updateStatus) {
          config.reloadSyncMap()
          logger.info(`Discord <-> Telegram: ${syncRecs[0].discord.guildId}(${syncRecs[0].discord.guildName}) ${syncRecs[0].discord.channelId}(${syncRecs[0].discord.channelName}) <-> ${syncRecs[0].telegram.groupId}(${syncRecs[0].telegram.groupName}) is Disabled.`)
          response = 'Channel sync to Telegram is disabled.'
        }
      } 
    } 
    return response
  } catch(e){
    console.error('Discord command [sync._disableSync] Error: ', e)
    return 'Ops.. something wrong when disabling sync.'
  }
}

const _removeSync = async (ch: Channel): Promise<string> => {
  try {
    let response = 'Channel must be disabled first.\nTo disable, type:\n\n    parrox sync disable'
    const syncRecs = await collectionSync.queryByChannel(ch.guildId, ch.channelId)
    if (syncRecs.length !== 0) {
      if (!syncRecs[0].isEnabled) {
        const deleteStatus = await collectionSync.deleteChannel(ch.guildId, ch.channelId)
        if (deleteStatus) {
          config.reloadSyncMap()
          logger.info(`Discord <-> Telegram: ${syncRecs[0].discord.guildId}(${syncRecs[0].discord.guildName}) ${syncRecs[0].discord.channelId}(${syncRecs[0].discord.channelName}) is permanently removed.`)
          response = 'Channel sync to Telegram is removed.'
        }
      } 
    } 
    return response
  } catch(e){
    console.error('Discord command [sync._removeSync] Error: ', e)
    return 'Ops.. something wrong when removing sync.'
  }
}

module.exports = {
	name: 'sync',
	async execute(message: Discord.Message, args: string[]) {        
    try {
      let response = ''

      if (isGuildOwner(message)) {
        const guildChannel = getGuildChannel(message, config.discord)
        const channel: Channel = {
          guildId: message.guildId!,
          guildName: message.guild!.name,
          channelId: message.channelId,
          channelName: guildChannel!.name,
          authorId: message.author.id,
          authorUsername: message.author.username
        }

        if (args.length === 0) {
          response = await _requestSync(channel)
        } else {
          switch (args[0].toLowerCase()) {
            case 'enable':
              response = await _enableSync(channel)
              break
            case 'disable':
              response = await _disableSync(channel)
              break
            case 'remove':
              response = await _removeSync(channel)
              break
            default:
              response = helpMessage
          }
        }
      } else {
        response = 'You have to be Server Owner to use sync command.'
      }
      message.channel.send('```' + response + '```').catch((e: Error) => {
        console.log('[discord-sync.execute] Error: ', e)
        return null
      })
    }
    catch(e){
      console.error('Discord command [sync] Error: ', e)
    }
	}
}
