const express = require('express');
const { getCourses } = require('../controller/courses');
const router = express.Router()

router.route('/').get(getCourses)

router.route('/:bootcampsId').get(getCourses)

module.exports = router