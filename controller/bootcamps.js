const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder')

const fs = require('fs')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

// image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('Invalid image type')

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extention = FILE_TYPE_MAP[file.mimetype]
        // const fileName = file.originalname.replace(' ', '-')
        const fileName = file.originalname.split(' ').join('-')
        cb(null, `${fileName}-${Date.now()}.${extention}`)
    }
})
const uploadOptions = multer({ storage: storage })

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => { // Instead of using try catch, you can use this asyncHandler function
    // console.log(req.query)

    let query;

    // Copy req.query. Use ... to copy an object
    const reqQuery = { ...req.query }
    // console.log(reqQuery.select.split(',').join(' '))

    // Fields to exclude
    // Event if you are removing this, the select query is gonna still work
    const removeFields = ['select', 'sort']

    // Loop over removeFields and delete them from reqQuery
    // Event if you are removing this, the select query is gonna still work
    removeFields.forEach(param => delete reqQuery[param])
    // console.log(reqQuery)

    // Create query string
    let queryStr = JSON.stringify(req.query)

    // Create operators ($gt, $gte, ect)
    // Documentation for this
    // https://www.mongodb.com/docs/manual/reference/operator/query/gt/
    queryStr = queryStr.replace(/\b(eq|gt|gte|in|lt|lte|ne|nin|in)\b/g, match => `$${match}`)
    // console.log(JSON.parse(queryStr))

    query = Bootcamp.find(JSON.parse(queryStr))

    if (req.query.select) {
        let selectedQuery = req.query.select.split(',').join(' ')
        query = query.select(selectedQuery)
    }

    if (req.query.sort) {
        let sortedQuery = req.query.sort.split(',').join(' ')
        query = query.sort(sortedQuery)
    } else {
        query = query.sort('-createdAt')
    }

    // Pagination
    const DEFAULT_PAGE_NUMBER = 1
    const DEFAULT_PAGE_LIMIT = 0

    if (req.query.page <= 0) {
        req.query.page = 1
    }
    
    const page = Math.abs(req.query.page) || DEFAULT_PAGE_NUMBER
    const limit = Math.abs(req.query.limit) || DEFAULT_PAGE_LIMIT
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit).populate('course')

    const getAllBootcamps = await query

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    if (!getAllBootcamps) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, count: getAllBootcamps.length, pagination: pagination, data: getAllBootcamps})
})

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const getBootcamp = await Bootcamp.findById(req.params.id).populate('course')

    if (!getBootcamp) {
        // res.status(400).json({success: false})
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, data: getBootcamp})
})

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(201).json({success: true, data: bootcamp })
})

// @desc    Upadte bootcamp
// @route   UPDATE /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const updateBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    
    if (!updateBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    
    res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`})
})

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const deleteBootcamp = await Bootcamp.findById(req.params.id)

    // Another way to delete table that has relations
    // Bootcamp.findByIdAndDelete(req.params.id).then( async (bootcamp) => {
    //     if (bootcamp) {
    //         await bootcamp.populate('course')
    //         await bootcamp.course.map(async (courses) => {
    //             await Course.findByIdAndDelete(courses)
    //         })
    //     } else {
    //         return res.status(400).json({
    //             success: false,
    //             message: 'Bootcamp not found'
    //         })
    //     }
    // })

    if (!deleteBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    deleteBootcamp.remove()
    
    res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`})
})

// @desc    Get bootcamps within radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth radius = 3,963 mi / 6,378 km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc    Upadte bootcamp photo
// @route   UPDATE /api/v1/bootcamps/:bootcampId/photo
// @access  Private
exports.updateBootcampPhoto = async (req, res, next) => {
    const checkExistBootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!checkExistBootcamp) return res.status(400).json({message: 'Invalid bootcamp'})

    let imagepath
    const checkIfTheIsFile = req.file

    if (!checkIfTheIsFile) {
        return res.status(404).json({message: 'Image does not exist'})
    }

    if (checkIfTheIsFile) {
        const filePath = './public/uploads'
        const splittedFile = checkExistBootcamp.image.split('/')
        // console.log(`${filePath}/${splittedFile[splittedFile.length - 1]}`)
        fs.unlink(`${filePath}/${splittedFile[splittedFile.length - 1]}`, function(err) {
            if(err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                console.info(`removed`);
            }
        })
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath = `${basePath}${fileName}`
    } else {
        imagepath = checkExistBootcamp.image
    }

    const updateBootcamp = await Bootcamp.findByIdAndUpdate(req.params.bootcampId,{ 
        image: imagepath 
    }, {
        new: true
    })
    
    if (!updateBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404))
    }
    
    res.send(updateBootcamp)
}

exports.uploadOptions = uploadOptions.single('image')