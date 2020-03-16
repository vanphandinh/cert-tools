const { Schema } = require('mongoose')

const revocationSchema = new Schema(
    {
        id: String,
        revocationReason: String,
        issuerId: String,
    },
    { timestamps: true, versionKey: false }
)

module.exports = revocationSchema
