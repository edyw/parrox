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
      // client.telegram.on('pinned_message', ctx => { eventTelegram.onPinnedMessage(ctx) }) // Disabled, temporary feature solution not well accepted
      
      client.discord.on('interactionCreate', interaction => { eventDiscord.onInteractionCreate(interaction) })
      client.discord.on('messageCreate', message => { eventDiscord.onMessageCreate(message) })
      // client.discord.on('messageUpdate', (messageOld, messageNew) => { eventDiscord.onMessageUpdate(messageOld, messageNew) }) // Disabled, temporary feature solution not well accepted
    }
  } catch (e) {
    logger.error('[] Error: ', e)
  }
}

void main()
