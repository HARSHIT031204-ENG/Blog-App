export class APIerror extends Error {
    constructor(statusCode, message ){
        super(message)
        this.statusCode = statusCode
    }
}


const HandleError = (err, req, res, next) => {
    return res.status(err.statusCode).json({
        success : false,
        message : err.message
    })
}