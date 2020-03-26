const { Schema } = require('mongoose')
const CONSTANTS = require('../../helpers/constants')

const certificationTemplateSchema = new Schema(
    {
        _id: { type: String },
        issuer: {
            type: String,
            ref: CONSTANTS.COLLECTIONS.ISSUERS,
            required: true,
        },
        badgeTemplate: {
            type: String,
            ref: CONSTANTS.COLLECTIONS.BADGE_TEMPLATES,
            required: true,
        },
        issuedOn: { type: String, required: true },
        issuerAddress: { type: String, required: true },
        displayHtml: String,
    },
    { timestamps: true, versionKey: false }
)

module.exports = certificationTemplateSchema
