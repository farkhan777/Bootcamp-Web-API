const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const Review = require('./models/Review')
const User = require('./models/User')

// Connect to DB
mongoose.connect(process.env.MONGO_URI)

// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, `utf-8`)
)

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, `utf-8`)
)

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`, `utf-8`)
)

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, `utf-8`)
)

// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await Review.create(reviews)
        await User.create(users)

        console.log('Data imported!')
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

// Delete all of the data from DB
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await Review.deleteMany()
        await User.deleteMany()

        console.log('Data destroyed!')
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

// Run `node seeder -i` to import data from json file to DB or `node seeder -d` to delete all of the data from DB
if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d') {
    deleteData()
}