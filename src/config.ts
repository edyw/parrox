import { Clients } from './types'
import collectionSync from './database/collection-sync'

const Config = class {
  clients: Clients | null
  syncMap: {
    channelId: Map<string,any>,
    groupId: Map<number,any>
  }
  constructor() {
    this.clients = null
    this.syncMap = {
      channelId: new Map(),
      groupId: new Map()
    }
  }
  init(clients: Clients) {
    this.clients = clients
  }
  async reloadSyncMap() {
    const syncRecs = await collectionSync.queryAllIsEnabled()
    this.syncMap.channelId.clear()
    this.syncMap.groupId.clear()
    syncRecs.forEach(sync => {
      this.syncMap.channelId.set(sync.discord.channelId, sync)
      this.syncMap.groupId.set(sync.telegram.groupId, sync)
    })
  }

  get mongo() {
    return this.clients!.mongo
  }
  get discord() {
    return this.clients!.discord
  }
  get telegram() {
    return this.clients!.telegram
  }
}

const config = new Config()

export default config
