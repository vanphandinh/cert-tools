const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const config = require('./config')
const Router = require('./routes/router')

const app = express()
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(
    express.static(path.join(__dirname, 'public'), {
        setHeaders: res => {
            res.setHeader('Access-Control-Allow-Origin', '*')
        },
    })
)

mongoose.Promise = global.Promise
mongoose.connect(config.mongodb.url, config.mongodb.options)

mongoose.connection.on('connected', () => {
    console.error('MongoDB connected')
})
mongoose.connection.on('error', err => {
    console.error(`MongoDB connection error: ${err}`)
    process.exit(-1)
})

const router = new Router(app)
router.registerRouters()

const port = process.env.port || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))
