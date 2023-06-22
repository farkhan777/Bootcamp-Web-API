const mongoose = require('mongoose')

const connectDB = async () => {
    const conn = await mongoose.connect("mongodb://bootcamp:ZATn6nEsXHPZSLLn@ac-mul5wwo-shard-00-00.zprk9kd.mongodb.net:27017,ac-mul5wwo-shard-00-01.zprk9kd.mongodb.net:27017,ac-mul5wwo-shard-00-02.zprk9kd.mongodb.net:27017/bootcamp?ssl=true&replicaSet=atlas-go0nn2-shard-0&authSource=admin&retryWrites=true&w=majority")

    console.log(`MongoDB Connected ${conn.connection.host}`)
}

module.exports = connectDB