import express from 'express'
import User from '../models/user'
import Group from '../models/group'
import middleware from '../utils/middleware'

const usersRouter = express.Router()

usersRouter.use(middleware.authRequired)
usersRouter.use(middleware.permissionRequired('AuthManAdmin'))

usersRouter.get('/', async (_req, res) => {
  const users = await User.find({})
  res.json(users)
})

usersRouter.put('/:id/group', async (req, res) => {
  const groupId = req.body.group
  const group = await Group.findById(groupId).lean()
  if(!group) {
    res.status(400).json({
      error: 'Group not found.'
    })
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, { group: groupId }).lean()
  if(updatedUser) {
    res.status(200).end()
  } else {
    res.status(404).end()
  }
})

export default usersRouter
