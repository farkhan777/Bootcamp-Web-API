const mongoose = require('mongoose')
require('dotenv/config')
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongoDB Connected ${conn.connection.host}`)
}

module.exports = connectDB