const mongoose = require('mongoose')
// require('dotenv/config')
require('dotenv').config()

const MONGO_URI = process.env.MONGO_URI

const connectDB = async () => {
    console.log(MONGO_URI)
    const conn = await mongoose.connect(MONGO_URI)

    console.log(`MongoDB Connected ${conn.connection.host}`)
}

module.exports = connectDB