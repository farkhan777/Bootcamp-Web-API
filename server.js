const express = require('express')
const cluster = require('cluster')
const os = require('os')
const morgan = require('morgan')
const dotenv = require('dotenv')

// Route files
const bootcampsRoutes = require('./routes/bootcamps')

// Load env vars
dotenv.config({ path: './config/config.env' })

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'))
}

app.use('/api/v1/bootcamps', bootcampsRoutes)

if(cluster.isMaster) {
    console.log('Master has been started')
    const NUM_WORKERS = os.cpus().length;
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }
} else {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    })
}