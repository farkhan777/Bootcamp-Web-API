const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampsId/courses
// @access  Public
exports.getCourses = asyncHandler( async (req, res, next) => {
    let query

    if (req.params.bootcampsId) {
        query = Course.find({ bootcamp: req.params.bootcampsId }).populate({path: 'bootcamp'})
    } else {
        query = Course.find().populate({path: 'bootcamp', select: 'name description'})
    }

    const course = await query

    if (!course) {
        return next(new ErrorResponse(`Course not found`, 404))
    }

    res.status(200).json({
        success: true,
        count: course.length,
        data: course
    })
})

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const getOneCourse = await Course.findById(req.params.id).populate({path: 'bootcamp', select: 'name'})

    if (!getOneCourse) {
        // res.status(400).json({success: false})
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, data: getOneCourse})
})

// @desc    Create new course
// @route   POST /api/v1/bootcamps/:bootcampsId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampsId

    const existBootcamp = await Bootcamp.findById(req.params.bootcampsId)
    if (!existBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampsId}`, 404))
    }

    const course = await Course.create(req.body)

    if (!course) {
        return next(new ErrorResponse(`Can't create course`, 500))
    }

    res.status(201).json({success: true, data: course })
})