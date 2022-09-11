const express = require('express');
const { getBootcamps, createBootcamp, getBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, updateBootcampPhoto } = require('../controller/bootcamps');

// Include other resource routers
// const { getCourses } = require('../controller/courses')
const courseRouter = require('./courses')

const router = express.Router()
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
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

// Re-route into other resource routers
// router.route('/:bootcampsId/courses').get(getCourses)
router.use('/:bootcampsId/courses', courseRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.put('/:bootcampId/photo', uploadOptions.single('image'), async (req, res, next) => {
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
})

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router