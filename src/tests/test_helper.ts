import Group from '../models/group'
import User from '../models/user'

const initialGroups = [
  {
    name: 'User',
    default: true,
    permissions: {},
  },
  {
    name: 'Admin',
    default: false,
    permissions: {
      AuthManAdmin: true
    },
  },
]

const initialUsers = [
  {
    username: 'root',
    password: 'secret'
  }
]

const nonExistingID = async () => {
  const group = new Group({ name: 'willremovethissoon', permissions: {} })
  await group.save()
  await group.remove()

  return group._id.toString()
}

const dbAllGroups = async () => {
    const groups = await Group.find({})
    return groups.map(group => group.toJSON())
}

const dbAllUsers = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

export default {
    initialGroups,
    initialUsers,
    nonExistingID,
    dbAllGroups,
    dbAllUsers
}
