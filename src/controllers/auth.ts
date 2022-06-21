import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import Group from '../models/group'
import config from '../utils/config'
import middleware, {AuthedRequest} from '../utils/middleware'

const authRouter = express.Router()
const saltRounds = 10

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username }).lean()
  const passwordCorrect = user === null ? false :
    await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const userGroup = await Group.findOne({ id: user.group }).lean()
  const permissions = userGroup? userGroup.permissions : {}

  const tokenData = {
    ...permissions,
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(tokenData, config.SECRET)

  res.status(200).json({
    token,
    username: user.username,
    permissions
  })
})

authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body

  const existingUser = await User.findOne({ username: username }).lean()
  if(existingUser) {
    return res.status(400).json({ error: 'Username must be unique.' })
  }

  const passwordHash = await bcrypt.hash(password, saltRounds)

  const defaultGroup = await Group.findOne({ default: true }).lean()
  if(!defaultGroup) {
    return res.status(500).json({ error: 'No default group found.' })
  }

  const user = new User({
    username,
    passwordHash,
    group: defaultGroup._id
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

authRouter.put('/password', middleware.authRequired, async (req: AuthedRequest, res) => {
  const userId = req.token?.id 
  const newPass = req.body.password
  const passwordHash = await bcrypt.hash(newPass, saltRounds)

  const updatedUser = await User.findByIdAndUpdate(userId, { passwordHash }, { new: true }).lean()
  if(updatedUser) {
    res.status(200).end()
  } else {
    res.status(400).end()
  }
})


export default authRouter
