import { DB } from '../helpers/id'
import config from '../config'
import { Document } from 'mongodb'

const queryByChannel = async (
  guildId: string, channelId: string
): Promise<Document[]> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)
    const query = {
      'discord.guildId': guildId,
      'discord.channelId': channelId,
    }
    return sync.find(query).toArray()
  } catch(e){
    console.error('Unable to query collection sync by Channel. ', e)
    return []
  }
}

const queryByGroupId = async (groupId: number): Promise<Document[]> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)
    const query = {
      'telegram.groupId': groupId
    }
    return sync.find(query).toArray()
  } catch(e){
    console.error('Unable to query collection sync by GroupId. ', e)
    return []
  }
}

const queryByLinkId = async (linkId: string): Promise<Document|undefined> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)
    const query = {
      linkId: linkId
    }
    return sync.findOne(query)
  } catch(e){
    console.error('Unable to query collection sync by linkId. ', e)
    return undefined
  }
}

const queryAllIsEnabled = async (): Promise<Document[]> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)
    const query = {
      isLinked: true,
      isEnabled: true
    }
    return sync.find(query).toArray()
  } catch(e){
    console.error('Unable to query all isEnabled collection sync. ', e)
    return []
  }
}

const upsertLinkId = async (
  guildId: string, guildName: string, channelId: string, channelName: string, authorId: string, authorName: string, linkId: string
): Promise<boolean> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)
    const query = {
      'discord.guildId': guildId,
      'discord.channelId': channelId,
    }
    const update = {
      $set: {
        discord: {
          guildId: guildId,
          guildName: guildName,
          channelId: channelId,
          channelName: channelName,
          authorId: authorId,
          authorName: authorName,
          timestamp: new Date()
        },
        isLinked: false,
        isEnabled: false,
        linkId: linkId,
        timestamp: new Date()
      }
    }
    const options = { upsert: true }
    await sync.updateOne(query, update, options)
    return true
  } catch(e){
    console.error('Unable to upsert linkId to collection sync. ', e)
    return false
  }
}

const updateGroup = async (
  linkId: string, groupId: number, groupName: string, userId: number, userFirstName: string
): Promise<boolean> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)

    const query = {
      linkId: linkId
    }
    const update = {
      $set: {
        telegram: {
          groupId: groupId,
          groupName: groupName,
          userId: userId,
          userFirstName: userFirstName,
          timestamp: new Date()
        },
        isLinked: true,
        isEnabled: true,
        timestamp: new Date()
      }
    }
    const options = { upsert: true }
    await sync.updateOne(query, update, options)
    return true
  } catch(e){
    console.error('Unable to update groupId to collection sync. ', e)
    return false
  }
}

const updateIsEnabled = async (guildId: string, channelId: string, isEnabled: boolean): Promise<boolean> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)

    const query = {
      'discord.guildId': guildId,
      'discord.channelId': channelId,
    }
    const update = {
      $set: {
        isEnabled: isEnabled,
        timestamp: new Date()
      }
    }
    await sync.updateOne(query, update)
    return true
  } catch(e){
    console.error('Unable to update isEnabled to collection sync. ', e)
    return false
  }
}

const deleteChannel = async (guildId: string, channelId: string): Promise<boolean> => {
  try {
    const sync = config.mongo.collection(DB.COLLECTION_SYNC)

    const query = {
      'discord.guildId': guildId,
      'discord.channelId': channelId,
    }
    await sync.deleteOne(query)
    return true
  } catch(e){
    console.error('Unable to delete by channel to collection sync. ', e)
    return false
  }
}

export default {
  queryByChannel,
  queryByGroupId,
  queryByLinkId,
  queryAllIsEnabled,
  upsertLinkId,
  updateGroup,
  updateIsEnabled,
  deleteChannel
}
