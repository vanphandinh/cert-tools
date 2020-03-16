const createIso8601String = () => {
    return new Date().toISOString()
}

module.exports = {
    createIso8601String,
}
