const { Schema } = require('mongoose')
const { v1: uuidv1 } = require('uuid')
const CONSTANTS = require('../../helpers/constants')

const issuerSchema = new Schema(
    {
        _id: { type: String, default: uuidv1() },
        publicKey: [
            {
                _id: false,
                id: String,
                created: Date,
                expires: Date,
                revoked: Date,
            },
        ],
        issuerTemplate: {
            type: String,
            ref: CONSTANTS.COLLECTIONS.ISSUER_TEMPLATES,
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
)

module.exports = issuerSchema
