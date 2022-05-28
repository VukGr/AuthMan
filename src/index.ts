import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'

import config from "./config"

dotenv.config()

const app = express()
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

// Group CRUD {{{
let groups = [
  { id: '1', name: 'test', permissions: { fileManAdmin: true } },
  { id: '2', name: 'test2', permissions: { fileManAdmin: false } },
]

let maxID = groups.length
function generateID() {
  maxID += 1  
  return `${maxID}`
}

app.get('/groups', (_req, res) => {
  res.json(groups)
})

app.get('/group/:id', (req, res) => {
  const id = req.params.id
  const group = groups.find(group => group.id === id)
  if(group) {
    res.json(group)
  } else {
    res.status(404).end()
  }
})

// TODO Change id, validation of some sort?
app.post('/groups', (req, res) => {
  const body = req.body

  if(!body) {
    return res.status(400).json({
      error: 'Body missing.'
    })
  }

  const newGroup = {
    id: generateID(),
    name: req.body.name,
    permissions: req.body.permissions || {}
  }
  groups.push(newGroup)

  res.json(newGroup)
})

app.put('/group/:id', (req, res) => {
  const id = req.params.id
  const newGroup = req.body
  const oldGroupIndex = groups.findIndex(group => group.id === id)

  if(oldGroupIndex != -1) {
    groups[oldGroupIndex] = newGroup
    res.json(newGroup)
  } else {
    res.status(404).end()
  }
})

app.delete('/group/:id', (req, res) => {
  const id = req.params.id
  groups = groups.filter(group => group.id !== id)
  res.status(204).end()
})
// }}}

const port = config.server.port
app.listen(port, () => {
  console.log(`[server]: Server running on port ${port}`)
})
