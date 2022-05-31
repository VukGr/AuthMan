import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/user'
import Group from '../models/group'

const usersRouter = express.Router()

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  const existingUser = await User.findOne({ username: username })
  if(existingUser) {
    return res.status(400).json({ error: 'Username must be unique.' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const defaultGroup = await Group.findOne({ default: true })
  if(!defaultGroup) {
    return res.status(500).json({ error: 'No default group found.' })
  }

  const user = new User({
    username,
    name,
    passwordHash,
    group: defaultGroup._id
  })

  const savedUser = await user.save()
  defaultGroup.users = defaultGroup.users.concat(savedUser._id)
  await defaultGroup.save()

  res.status(201).json(savedUser)
})

usersRouter.get('/', async (_req, res) => {
  const users = await User.find({})
  res.json(users)
})

export default usersRouter
