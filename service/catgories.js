const db = require("../models");

const findAll = async () => {
    return await db.Category.findAll()
}

const findOne = async (slug) => {
    return await db.Category.findOne({
        where: {
            slug
        }
    })
}

module.exports = { findAll, findOne }