const express = require('express')
const { register, login, getMe, forgotPassword, resetPassword } = require('../controller/auth')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me',protect, getMe)
router.post('/forgotPassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)

module.exports = router