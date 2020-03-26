const _ = require('lodash')
const mongoose = require('mongoose')
const schema = require('../schemas/issuer')
const CONSTANTS = require('../../helpers/constants')

const model = mongoose.model(CONSTANTS.COLLECTIONS.ISSUERS, schema)

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

const getByIdAndPopulate = (id, populateFields) => {
    return new Promise((resolve, reject) => {
        const query = model.findById(id)
        _.forEach(populateFields, f => {
            query.populate(f)
        })
        query
            .exec()
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
    return new Promise((resolve, reject) => {
        model
            .find({})
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

const updateById = (id, docs) => {
    return model.updateOne({ _id: id }, docs)
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
    getByIdAndPopulate,
    getOneByCondition,
    getManyByCondition,
    getAll,
    updateById,
    removeById,
    removeAll,
}
