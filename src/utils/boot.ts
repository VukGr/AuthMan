import Group from '../models/group'
import config from './config'
import logger from './logger'

const checkDefaultGroup = async () => {
  const defaultGroups =
    await Group.find({ default: true}).lean()

  if(defaultGroups.length > 1) {
    logger.error('[boot]: More than one default group found, please remove one manually.')
    throw new Error('More than one default group')
  }

  if(defaultGroups.length == 0) {
    logger.info('[boot]: Default group not found, creating Admin group as default. ' + 
                'Please remember to change it after you create the admin user.')

    const adminGroup = new Group({
      name: 'Admin',
      permissions: {},
      default: true
    })

    adminGroup.permissions[config.ADMIN_PERM] = true
 
    await adminGroup.save()
  }
}

export default {
  checkDefaultGroup
}
