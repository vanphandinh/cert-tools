const issuerRouter = require('./issuer')
const certificationRouter = require('./certification')

class Router {
    constructor(app) {
        this.app = app
    }

    registerRouters() {
        this.app.use('/issuers', issuerRouter)
        this.app.use('/certifications', certificationRouter)
    }
}

module.exports = Router
