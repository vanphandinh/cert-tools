const { Schema } = require('mongoose')
const { v1: uuidv1 } = require('uuid')

const badgeTemplateSchema = new Schema(
    {
        _id: { type: String, default: uuidv1() },
        name: String,
        description: String,
        image: String,
        criteria: {
            narrative: String,
        },
        signatureLines: [
            {
                _id: false,
                jobTitle: String,
                image: String,
                name: String,
            },
        ],
    },
    { timestamps: true, versionKey: false }
)

module.exports = badgeTemplateSchema
