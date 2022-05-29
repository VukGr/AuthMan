import http from 'http'
import app from './app'
import config from './utils/config'
import logger from './utils/logger'

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`[server]: Server running on port ${config.PORT}`)
})
