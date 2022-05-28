let config = {
    server: {
        port: process.env.PORT || 8080,
    },
    mongo: {
        url: process.env.MONGODB_URL || 'mongodb://localhost',
        user: process.env.MONGODB_USER || '',
        pass: process.env.MONGODB_PASS || '',
    },
}

export default config
