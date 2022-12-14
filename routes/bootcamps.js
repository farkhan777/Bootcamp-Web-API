const express = require('express');
const { getBootcamps, createBootcamp, getBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, updateBootcampPhoto, uploadOptions } = require('../controller/bootcamps');

const Bootcamp = require('../models/Bootcamp')

// Include other resource routers
// const { getCourses } = require('../controller/courses')
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

// Re-route into other resource routers
// router.route('/:bootcampsId/courses').get(getCourses)
router.use('/:bootcampsId/courses', courseRouter)
router.use('/:bootcampsId/reviews', reviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/:bootcampId/photo').put(protect, authorize('publisher', 'admin'), uploadOptions, updateBootcampPhoto)

router.route('/')
    .get(advancedResults(Bootcamp, 'course'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router