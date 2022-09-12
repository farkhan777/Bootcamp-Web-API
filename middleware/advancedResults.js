const advancedResults = (model, populate) => async (req, res, next) => {
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
    
        query = model.find(JSON.parse(queryStr))
    
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
        const total = await model.countDocuments()
    
        query = query.skip(startIndex).limit(limit)

        if (populate) {
            query = query.populate(populate)
        }
    
        const results = await query
    
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
    
        if (!results) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        }

        next()
}

module.exports = advancedResults