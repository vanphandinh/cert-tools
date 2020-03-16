const { Schema } = require('mongoose')
const { v1: uuidv1 } = require('uuid')

const issuerTemplateSchema = new Schema(
    {
        _id: { type: String, default: uuidv1() },
        name: String,
        url: String,
        email: String,
        telephone: String,
        description: String,
        image: String,
    },
    { timestamps: true, versionKey: false }
)

module.exports = issuerTemplateSchema
