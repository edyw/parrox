import Discord from 'discord.js'

const isGuildOwner = (message: Discord.Message) => {
  return (message.guild?.ownerId === message.author.id)
}

const getGuildChannel = (message: Discord.Message, discord: Discord.Client): Discord.GuildChannel|Discord.ThreadChannel|null => {
  const guild = discord.guilds.cache.find(guild => guild.id === message.guildId)
  if (guild !== undefined) {
    const channel = guild.channels.cache.find(channel => channel.id === message.channelId)
    if (channel !== undefined) 
      return channel
    else
      return null
  }
  return null
}

export {
  isGuildOwner,
  getGuildChannel
}
