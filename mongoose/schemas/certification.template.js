const { Schema } = require('mongoose')
const CONSTANTS = require('../../helpers/constants')

const certificationTemplateSchema = new Schema(
    {
        issuer: { type: String, ref: CONSTANTS.COLLECTIONS.ISSUERS },
        badgeTemplate: {
            type: String,
            ref: CONSTANTS.COLLECTIONS.BADGE_TEMPLATES,
        },
    },
    { timestamps: true, versionKey: false }
)

module.exports = certificationTemplateSchema
