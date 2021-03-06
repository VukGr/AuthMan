import dotenv from 'dotenv'

dotenv.config()

let config = {
    PORT: process.env.PORT || 8080,
    MONGO_URI: (process.env.NODE_ENV === 'test'?
        process.env.TEST_MONGODB_URI : process.env.MONGODB_URI)
        || 'mongodb://localhost',
    NODE_ENV: process.env.NODE_ENV || 'production',
    SECRET: process.env.SECRET || 'test-secret-token',
    ADMIN_PERM: process.env.ADMIN_PERM || 'AuthManAdmin'
}

export default config
