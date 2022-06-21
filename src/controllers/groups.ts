import express from 'express'
import Group from '../models/group'
import User from '../models/user'
import config from '../utils/config'
import middleware from '../utils/middleware'

const groupsRouter = express.Router()

groupsRouter.use(middleware.authRequired)
groupsRouter.use(middleware.permissionRequired(config.ADMIN_PERM))

// Default group operations
groupsRouter.get('/default', async (_req, res) => {
  res.json(await Group.find({ default: true }))
})

groupsRouter.put('/default', async (req, res) => {
  const newId = req.body.id
  if(!newId) {
    res.status(400).json({ error: 'New default ID not given.' })
  }

  const oldDefaultGroup = 
    await Group.findOneAndUpdate({ default: true }, { default: false}, { new: true })

  const newDefaultGroup =
    await Group.findByIdAndUpdate(newId, { default: true}, { new: true })

  if(newDefaultGroup) {
    res.json({ 
      old: oldDefaultGroup, 
      new: newDefaultGroup, 
    })
  } else {
    // Reset to old group.
    if(oldDefaultGroup)
      await Group.findByIdAndUpdate(oldDefaultGroup.id, { default: true})
    res.status(404).json({ error: 'New default group not found.' })
  }
})

// Group CRUD
groupsRouter.get('/', async (_req, res) => {
  res.json(await Group.find({}))
})

groupsRouter.get('/:id', async (req, res) => {
  const group = await Group.findById(req.params.id)

  if(group) {
    res.json(group)
  } else {
    res.status(404).end()
  }
})

groupsRouter.post('/', async (req, res) => {
  const body = req.body

  if(!body.name) {
    return res.status(400).json({
      error: 'Name cannot be empty.'
    })
  }

  const newGroup = new Group({
    name: body.name,
    permissions: body.permissions || {},
    default: false
  })

  const savedGroup = await newGroup.save()
  res.status(201).json(savedGroup)
})

groupsRouter.put('/:id', async (req, res) => {
  const body = req.body

  if(!body.name) {
    return res.status(400).json({
      error: 'Name cannot be empty.'
    })
  }

  const group = {
    name: body.name,
    permissions: body.permissions || {}
  }

  const updatedGroup = await Group.findByIdAndUpdate(req.params.id, group, { new: true })

  if(updatedGroup) {
    res.json(updatedGroup)
  } else {
    res.status(404).end()
  }
})

groupsRouter.delete('/:id', async (req, res) => {
  const groupId = req.params.id
  const defaultGroup = await Group.findOne({ default: true })

  if(groupId !== defaultGroup?.id) {
    await Group.findByIdAndRemove(req.params.id)
    await User.updateMany({ group: req.params.id }, { group: defaultGroup?.id })
    res.status(204).end()
  } else {
    res.status(400).json({
      error: 'Cannot delete default group.'
    })
  }
})

export default groupsRouter
