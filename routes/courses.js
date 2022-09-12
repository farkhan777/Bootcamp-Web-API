const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controller/courses');
const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')
const { protect } = require('../middleware/auth')

// const router = express.Router()

const router = express.Router({ mergeParams: true })

router.route('/').get( advancedResults(Course, {path: 'bootcamp', select: 'name description'}), getCourses).post(protect, createCourse)
router.route('/:id').get(getCourse).put(protect, updateCourse).delete(protect, deleteCourse)

// If you put the /:bootcampsId right here, it will crash with the /:id/. There for you have to put it in bootcamps routes
// router.route('/:bootcampsId').get(getCourses)

module.exports = router