const express = require('express');
const { getCourses, getCourse, createCourse } = require('../controller/courses');
// const router = express.Router()

const router = express.Router({ mergeParams: true })

router.route('/').get(getCourses).post(createCourse)
router.route('/:id').get(getCourse)

// If you put the /:bootcampsId right here, it will crash with the /:id/. There for you have to put it in bootcamps routes
// router.route('/:bootcampsId').get(getCourses)

module.exports = router