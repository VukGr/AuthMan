import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
require('express-async-errors')

import config from './utils/config'
import logger from './utils/logger'
import groupRouter from './controllers/groups'
import middleware from './utils/middleware'

const app = express()

mongoose.connect(config.MONGO_URI)
  .then(_res => {
    logger.info('[mongo]: Connected to database sucessfully.')
  })
  .catch(err => {
    logger.info('[mongo]: Error connecting to database: ' + err.message)
  })

app.use(cors())
app.use(express.json())
app.use(morgan('tiny', { skip: (_req, _res) => config.NODE_ENV === 'test'}))

app.use('/groups', groupRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
