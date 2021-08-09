import { customAlphabet } from "nanoid"

const generateLinkId = () => {
  const customId = customAlphabet('1234567890abcdef', 8)
  return customId()
}

const DB = {
  COLLECTION_SYNC: 'sync'
}

export {
  generateLinkId,
  DB
}