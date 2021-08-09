import 'dotenv/config'
import fs from 'fs'
import Discord from 'discord.js'
import { Telegraf } from 'telegraf'
import { MongoClient } from 'mongodb'
import logger from './helpers/logger'
import { Clients, DiscordClient } from './types'
import config from './config'

const _discordClient = () => {
  try {
    const clientDiscord = new DiscordClient({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })
    clientDiscord.login(process.env.DISCORD_BOT_TOKEN)

    const commandFiles = fs.readdirSync('./src/discord-commands').filter(file => file.endsWith('.ts'))
    for (const file of commandFiles) {
        const command = require(`./discord-commands/${file}`)
        clientDiscord.commands.set(command.name, command)
    }
    clientDiscord.on('ready', () => {
      logger.info(`[discord] ${clientDiscord.user!.tag} ready`)
    })
    return clientDiscord
  } catch (e) {
    logger.error('Unable to initialize discord client. ', e)
    return null
  }
}

const _telegramClient = () => {
  try {
    const clientTelegram = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)
    clientTelegram.launch()
    clientTelegram.telegram.getMe().then(me => {
      logger.info(`[telegram] ${ me.first_name} ready!`)
    })
    return clientTelegram
  } catch (e) {
    logger.error('Unable to initialize telegram client. ', e)
    return null
  }
}

const _mongoClient = async () => {
  try {
    const mongoClient = new MongoClient(process.env.MONGO_URI!)
    const dbStatus = await mongoClient.connect()
    logger.info(`[mongo] Connected host: ${dbStatus.options.hosts[0].host}, port: ${dbStatus.options.hosts[0].port}`)
    const db = mongoClient.db(process.env.MONGO_DB_NAME)
    return db
  } catch (e) {
    logger.error('Unable to initilize mongo client. ', e)
    return null
  }
}

const initialize = async (): Promise<Clients | null>  => {
  try {
    const mongo = await _mongoClient()
    const discord = _discordClient()
    const telegram = _telegramClient()

    if (!!mongo && !!discord && !!telegram) {
      config.init({ mongo, discord, telegram })
      config.reloadSyncMap()
      return {
        mongo: mongo,
        discord: discord,
        telegram: telegram
      }
    } else {
      return null
    }
  } catch (e) {
    logger.error('Failed initializing dependecies. ', e)
    return null
  }

}

export default initialize
