const express = require('express');
const { getReviews, getReview, addReview, updateReview, deleteReview } = require('../controller/reviews');
const Review = require('../models/Review')

// const router = express.Router()

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
        .get(advancedResults(Review, {path: 'bootcamp', select: 'name description'}), getReviews)
        .post(protect, authorize('user', 'admin'), addReview)

router
    .route('/:id')
        .get(getReview)
        .put(protect, authorize('user', 'admin'), updateReview)
        .delete(protect, authorize('user', 'admin'), deleteReview)

// If you put the /:bootcampsId right here, it will crash with the /:id/. There for you have to put it in bootcamps routes
// router.route('/:bootcampsId').get(getCourses)

module.exports = router 