const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a tittle fro review'],
        maxlength: 100
    },
    text: {
        type: String,
        trim: true,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        max: 10,
        min: 1,
        required: [true, 'Please add rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

// Static method to get average of ratingand save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: { $avg: "$rating" },
            }
        }
    ])

    // console.log(obj)

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.log(err)
    }
}

// Call getAverageCost after save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp)
})

// Call getAverageCost before save
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)