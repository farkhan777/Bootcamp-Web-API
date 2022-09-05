const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {
    let error = {...err}

    error.message = err.message

    // log console for dev
    console.log(err)

    if (err.name === 'CastError') {
        const message = `Bootcamp not found with id of ${err.value}`
        error = new ErrorResponse(message, 404)
    }

    res.status(error.statusCode).json({
        success: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler