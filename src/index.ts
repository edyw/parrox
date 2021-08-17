import initialize from './initializer'
import logger from './helpers/logger'
import eventDiscord from './event-handlers/event-discord'
import eventTelegram from './event-handlers/event-telegram'

const main = async () => {
  try {
    const client = await initialize()

    if (!!client) {
      client.telegram.on('text', ctx => { eventTelegram.onText(ctx) })
      client.telegram.on('sticker', ctx => { eventTelegram.onSticker(ctx) })
      client.telegram.on('photo', ctx => { eventTelegram.onPhoto(ctx) })
      client.telegram.on('animation', ctx => { eventTelegram.onAnimation(ctx) })
      client.discord.on('interactionCreate', interaction => { eventDiscord.onInteractionCreate(interaction) })
      client.discord.on('messageCreate', message => { eventDiscord.onMessageCreate(message) })
    }
  } catch (e) {
    logger.error('[] Error: ', e)
  }
}

void main()
