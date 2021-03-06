const _ = require('lodash')
const mongoose = require('mongoose')
const schema = require('../schemas/signature')
const CONSTANTS = require('../../helpers/constants')

const model = mongoose.model(CONSTANTS.COLLECTIONS.SIGNATURES, schema)

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

const createMany = arrayDocs => {
    return new Promise((resolve, reject) => {
        model
            .insertMany(arrayDocs)
            .then(result => {
                if (result) resolve(_.map(result, r => r._id))
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

const getOneByCondition = conditions => {
    return new Promise((resolve, reject) => {
        model
            .findOne(conditions)
            .then(result => {
                if (result) resolve(result._doc)
                else resolve()
            })
            .catch(error => {
                reject(error.message)
            })
    })
}

const getManyByCondition = conditions => {
    return new Promise((resolve, reject) => {
        model
            .find(conditions)
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

const updateById = (id, docs) => {
    return model.updateOne({ _id: id }, docs)
}

const updateManyByCondition = (conditions, docs) => {
    return model.updateMany(conditions, { $set: docs })
}

const removeById = id => {
    return model.deleteOne({ _id: id })
}

const removeAll = () => {
    return model.deleteMany({})
}

module.exports = {
    create,
    createMany,
    getById,
    getOneByCondition,
    getManyByCondition,
    getAll,
    updateById,
    updateManyByCondition,
    removeById,
    removeAll,
}
