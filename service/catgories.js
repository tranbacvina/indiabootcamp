const db = require("../models");

const findAll = async () => {
    return await db.Category.findAll()
}

module.exports = { findAll }