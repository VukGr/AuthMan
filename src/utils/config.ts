import dotenv from 'dotenv'
import logger from './logger'

dotenv.config()

logger.info('[config]: Configuring...')

let config = {
    PORT: process.env.PORT || 8080,
    MONGO_URI: process.env.MONGODB_URI || 'mongodb://localhost',
}

export default config
