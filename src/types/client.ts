import Discord from 'discord.js'
import { Db } from 'mongodb'
import { Telegraf } from 'telegraf'

export class DiscordClient extends Discord.Client {
  commands: Discord.Collection<any, any>
  constructor(options: any) {
    super(options)
    this.commands = new Discord.Collection()
  }
}

export interface Clients {
  mongo: Db,
  discord: DiscordClient,
  telegram: Telegraf
}
