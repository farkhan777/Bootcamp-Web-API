const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamps')
const ErrorResponse = require('../utils/errorResponse')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => { // Instead of using try catch, you can use this asyncHandler function
    const getAllBootcamps = await Bootcamp.find()

    if (!getAllBootcamps) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, count: getAllBootcamps.length, data: getAllBootcamps})
})

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const getBootcamp = await Bootcamp.findById(req.params.id)

    if (!getBootcamp) {
        // res.status(400).json({success: false})
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, data: getBootcamp})
})

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, data: bootcamp })
})

// @desc    Upadte bootcamp
// @route   UPDATE /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const updateBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    
    if (!updateBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    
    res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`})
})

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const deleteBootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if (!deleteBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    
    res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`})
})
