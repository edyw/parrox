import config from '../config'
import logger from './logger'

const isGroupAdminOrOwner = async (chatId: number, userId: number): Promise<boolean> => {
  try {
    const groupAdmins = await config.telegram.telegram.getChatAdministrators(chatId)
    const isGroupAdmin = groupAdmins.findIndex(admin => (admin.status === 'administrator' || admin.status === 'creator') && !admin.user.is_bot && admin.user.id === userId)
    return (isGroupAdmin !== -1)
  } catch (e) {
    logger.error('Failed validating telegram user is group admin. ', e)
    return false
  }
}

export {
  isGroupAdminOrOwner
}
