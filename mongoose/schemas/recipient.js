const { Schema } = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const CONSTANTS = require('../../helpers/constants')

const recipientSchema = new Schema(
    {
        _id: { type: String },
        id: { type: String, default: uuidv4() },
        name: { type: String, required: true },
        publicKey: { type: String, required: true },
        identity: { type: String, required: true },
        status: { type: Number, default: 0 },
        hash: String,
        certTemplateId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
)

module.exports = recipientSchema
