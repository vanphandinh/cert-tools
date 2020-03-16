const _ = require('lodash')
const mongoose = require('mongoose')
const schema = require('../schemas/revocation')
const CONSTANTS = require('../../helpers/constants')

const model = mongoose.model(CONSTANTS.COLLECTIONS.REVOCATIONS, schema)

const create = docs => {
    return new Promise((resolve, reject) => {
        model
            .create(docs)
            .then(result => {
                if (result) resolve(result._id)
                else resolve()
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

const getById = id => {
    return new Promise((resolve, reject) => {
        model
            .findById(id)
            .then(result => {
                if (result) resolve(result._doc)
                else resolve()
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

const getOneByCondition = condition => {
    return new Promise((resolve, reject) => {
        model
            .findOne(condition)
            .then(result => {
                if (result) resolve(result._doc)
                else resolve()
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

const getManyByCondition = condition => {
    return new Promise((resolve, reject) => {
        model
            .find(condition)
            .then(result => {
                if (result) {
                    result = _.map(result, e => e._doc)
                    resolve(result)
                } else resolve()
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

const getAll = () => {
    return getManyByCondition({})
}

const updateById = (id, doc) => {
    return model.updateOne({ _id: id }, doc)
}

const removeById = id => {
    return model.deleteOne({ _id: id })
}

const removeAll = () => {
    return model.deleteMany({})
}

module.exports = {
    create,
    getById,
    getOneByCondition,
    getManyByCondition,
    getAll,
    updateById,
    removeById,
    removeAll,
}