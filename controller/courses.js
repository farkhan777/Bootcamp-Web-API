const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampsId/courses
// @access  Public
exports.getCourses = asyncHandler( async (req, res, next) => {
    if (req.params.bootcampsId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampsId })

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
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
    // Add user to req.body
    // console.log(req.user) req.user is from auth middleware
    req.body.user = req.user.id

    const existBootcamp = await Bootcamp.findById(req.params.bootcampsId)
    if (!existBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampsId}`, 404))
    }

    // Make sure user is bootcamp owner
    if (existBootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id}is not authorized create this`, 401))
    }

    const course = await Course.create(req.body)

    if (!course) {
        return next(new ErrorResponse(`Can't create course`, 500))
    }

    res.status(201).json({success: true, data: course })
})

// @desc    Update course
// @route   POST /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    // Make sure user is bootcamp owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id}is not authorized to update this`, 401))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, 
        {
            new: true,
            runValidators: true 
        }
    )

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({success: true, data: course})
})

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const deleteCourse = await Course.findById(req.params.id)

    // Make sure user is bootcamp owner
    if (deleteCourse.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id}is not authorized to delete this`, 401))
    }

    if (!deleteCourse) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404))
    }

    deleteCourse.remove()
    
    res.status(200).json({success: true, msg: `Delete course ${req.params.id}`})
})