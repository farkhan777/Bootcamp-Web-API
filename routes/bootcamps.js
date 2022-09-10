const express = require('express');
const { getBootcamps, createBootcamp, getBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius } = require('../controller/bootcamps');

// Include other resource routers
// const { getCourses } = require('../controller/courses')
const courseRouter = require('./courses')

const router = express.Router()

// Re-route into other resource routers
// router.route('/:bootcampsId/courses').get(getCourses)
router.use('/:bootcampsId/courses', courseRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router