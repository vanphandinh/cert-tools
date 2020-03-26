const { Schema } = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const CONSTANTS = require('../../helpers/constants')

const signatureSchema = new Schema(
    {
        _id: { type: String, default: uuidv4() },
        targetHash: { type: String, required: true },
        merkleRoot: { type: String, required: true },
        proof: {
            type: [
                {
                    _id: false,
                    right: String,
                    left: String,
                },
            ],
            required: true,
        },
        anchors: [
            {
                _id: false,
                sourceId: String,
            },
        ],
    },
    { timestamps: true, versionKey: false }
)

module.exports = signatureSchema
