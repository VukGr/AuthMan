import express from 'express'
import Group from '../models/group'

const groupsRouter = express.Router()

groupsRouter.get('/', (_req, res) => {
  Group.find({}).then(groups => {
    res.json(groups)
  })
})

groupsRouter.get('/:id', (req, res, next) => {
  Group.findById(req.params.id).then(group => {
    if(group) {
      res.json(group)
    } else {
      res.status(404).end()
    }
  }).catch(err => next(err))
})

groupsRouter.post('/', (req, res) => {
  const body = req.body

  if(!body.name) {
    return res.status(400).json({
      error: 'Name missing.'
    })
  }

  const newGroup = new Group({
    name: body.name,
    permissions: body.permissions || {}
  })

  newGroup.save().then(savedGroup => res.json(savedGroup))
})

groupsRouter.put('/:id', (req, res, next) => {
  const body = req.body

  const group = {
    name: body.name,
    permissions: body.permissions || {}
  }

  Group.findByIdAndUpdate(req.params.id, group, { new: true })
    .then(updatedGroup => {
      if(updatedGroup) {
        res.json(updatedGroup)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

groupsRouter.delete('/:id', (req, res, next) => {
  Group.findByIdAndRemove(req.params.id)
    .then(_ => res.status(204).end())
    .catch(err => next(err))
})

export default groupsRouter
