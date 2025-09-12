export const ErrorFunc = (theFunc) => {
    return (req, res, next) => {
        Promise.resolve(theFunc(req, res, next)).catch(next)
    }
}