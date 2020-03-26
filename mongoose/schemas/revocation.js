const { Schema } = require('mongoose')

const revocationSchema = new Schema(
    {
        id: { type: String, required: true },
        revocationReason: String,
        issuerId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
)

module.exports = revocationSchema
