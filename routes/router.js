const issuerRouter = require('./issuer')
const certificationRouter = require('./certification')
const recipientRouter = require('./recipient')

class Router {
    constructor(app) {
        this.app = app
    }

    registerRouters() {
        this.app.use('/issuers', issuerRouter)
        this.app.use('/certifications', certificationRouter)
        this.app.use('/recipients', recipientRouter)
    }
}

module.exports = Router
