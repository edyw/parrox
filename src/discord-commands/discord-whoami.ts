import Discord from 'discord.js'
import { isGuildOwner } from '../helpers/discord-object'

module.exports = {
	name: 'whoami',
	async execute(message: Discord.Message, args: string[]) {        
    try {
      const response =
        `ID: ${message.author.id}\nUsername: ${message.author.username}\nOwner: ${isGuildOwner(message)}`
      message.channel.send('```' + response + '```')
    }
    catch(e){
      console.error('Discord command [whoami] Error: ', e)
    }
	}
}
