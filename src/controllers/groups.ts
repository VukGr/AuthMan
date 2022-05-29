import express from 'express'
import Group from '../models/group'

const groupsRouter = express.Router()

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
    permissions: body.permissions || {}
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
  await Group.findByIdAndRemove(req.params.id)
  res.status(204).end()
})

export default groupsRouter
