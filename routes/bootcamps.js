const express = require('express');
const { getBootcamps, createBootcamp, getBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, updateBootcampPhoto, uploadOptions } = require('../controller/bootcamps');

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// Include other resource routers
// const { getCourses } = require('../controller/courses')
const courseRouter = require('./courses')

const router = express.Router()

const { protect } = require('../middleware/auth')

// Re-route into other resource routers
// router.route('/:bootcampsId/courses').get(getCourses)
router.use('/:bootcampsId/courses', courseRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/:bootcampId/photo').put(protect, uploadOptions, updateBootcampPhoto)

router.route('/')
    .get(advancedResults(Bootcamp, 'course'), getBootcamps)
    .post(protect, createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp);

module.exports = router