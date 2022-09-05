const Bootcamp = require('../models/Bootcamps')
const ErrorResponse = require('../utils/errorResponse')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const getAllBootcamps = await Bootcamp.find()

        if (!getAllBootcamps) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        res.status(201).json({success: true, count: getAllBootcamps.length, data: getAllBootcamps})
    } catch (err) {
        // res.status(400).json({error: err})
        next(err)
    }
}

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const getBootcamp = await Bootcamp.findById(req.params.id)

        if (!getBootcamp) {
            // res.status(400).json({success: false})
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        res.status(201).json({success: true, data: getBootcamp})
    } catch (err) {
        // res.status(400).json({error: err})
        next(err)
        // next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
}

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body)

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        res.status(201).json({success: true, data: bootcamp })
    } catch (err) {
        // res.status(400).json({success: false})
        next(err)
    }
}

// @desc    Upadte bootcamp
// @route   UPDATE /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const updateBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
    
        if (!updateBootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
    
        res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`})
    } catch (err) {
        // res.status(400).json({success: false})
        next(err)
    }
}

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const deleteBootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

        if (!deleteBootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
    
        res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`})
    } catch (err) {
        // res.status(400).json({success: false})
        next(err)
    }
}