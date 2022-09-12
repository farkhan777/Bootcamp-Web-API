const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
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


    res.status(200).json(res.advancedResults)
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

    let photopath
    const checkIfTheIsFile = req.file

    if (!checkIfTheIsFile) {
        return res.status(404).json({message: 'Photo does not exist'})
    }

    if (checkIfTheIsFile) {
        const filePath = './public/uploads'
        const splittedFile = checkExistBootcamp.photo.split('/')
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
        photopath = `${basePath}${fileName}`
    } else {
        photopath = checkExistBootcamp.photo
    }

    const updateBootcamp = await Bootcamp.findByIdAndUpdate(req.params.bootcampId,{ 
        photo: photopath 
    }, {
        new: true
    })
    
    if (!updateBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404))
    }
    
    res.send(updateBootcamp)
}

exports.uploadOptions = uploadOptions.single('photo')