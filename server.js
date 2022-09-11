const express = require('express')
const cluster = require('cluster')
const os = require('os')
const morgan = require('morgan')
const dotenv = require('dotenv')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Route files
const bootcampsRoutes = require('./routes/bootcamps')
const coursesRoutes = require('./routes/courses')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'))
}
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

app.use('/api/v1/bootcamps', bootcampsRoutes)
app.use('/api/v1/courses', coursesRoutes)
app.use(errorHandler)

if(cluster.isMaster) {
    console.log('Master has been started')
    const NUM_WORKERS = os.cpus().length;
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }
} else {
    connectDB()
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    })
}