const express = require('express')
const cluster = require('cluster')
const os = require('os')
const morgan = require('morgan')
require('dotenv').config();
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require("helmet")
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const swaggerjsdoc = require('swagger-jsdoc')
const swaggerui = require('swagger-ui-express')

// Load env vars
// dotenv.config({ path: '.env' })

// Route files
const bootcampsRoutes = require('./routes/bootcamps')
const coursesRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const reviewsRoutes = require('./routes/reviews')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())
// Secutiry
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10ms
    max: 100 // maximum 100 request in 10ms
})

app.use(limiter)

// Secutiry
// Prevent http param pollution
app.use(hpp())


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'))
}
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

app.use('/api/v1/bootcamps', bootcampsRoutes)
app.use('/api/v1/courses', coursesRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/reviews', reviewsRoutes)
app.use(errorHandler)



// const options = {
//     definition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'Express API for Bootcamp Web API',
//             version: '1.0.0',
//             description:
//             "Backend API for Bootcamp Web application, which is a bootcamp directory website made with Express to manage bootcamps, course, users, and authentication",
//             contact: {
//                 name: 'Farkhan Hamzah Firdaus',
//                 url: 'https://my-porto-zeta.vercel.app/'
//             }
//         },
//         servers: [
//             {
//                 url: 'http://localhost:5000/',
//             },
//         ],
//     },
//     apis: ['./routes/*.js'],
// }; 

// const spacs = swaggerjsdoc(options);

// app.use(
//     "/docs",
//     swaggerui.serve,
//     swaggerui.setup(spacs)
// )

connectDB()
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

// if(cluster.isMaster) {
//     console.log('Master has been started')
//     const NUM_WORKERS = os.cpus().length;
//     for (let i = 0; i < NUM_WORKERS; i++) {
//         cluster.fork();
//     }
// } else {

// }