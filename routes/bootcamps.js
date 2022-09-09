const express = require('express');
const { getBootcamps, createBootcamp, getBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius } = require('../controller/bootcamps');
const router = express.Router()

// Include other resource routers
const { getCourses } = require('../controller/courses')

// Re-route into other resource routers
router.route('/:bootcampsId/courses').get(getCourses)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router