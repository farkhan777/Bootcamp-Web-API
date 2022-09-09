const asyncHandler = require('../middleware/async')
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
        query = Course.find().populate({path: 'bootcamp', select: 'name'})
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