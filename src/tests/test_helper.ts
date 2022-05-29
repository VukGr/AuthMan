import Group from '../models/group'

const initialGroups = [
  {
    name: 'User',
    permissions: {},
  },
  {
    name: 'Admin',
    permissions: {
      AuthManAdmin: true
    },
  },
]

const nonExistingID = async () => {
  const group = new Group({ name: 'willremovethissoon', permissions: {} })
  await group.save()
  await group.remove()

  return group._id.toString()
}

const allGroups = async () => {
    const groups = await Group.find({})
    return groups.map(group => group.toJSON())
}

export default {
    initialGroups,
    nonExistingID,
    allGroups
}
