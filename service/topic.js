const db = require("../models")

const findAll = async () => {
    const allTopics = await db.Topic.findAll()
    return allTopics
}

// const findAllwithCourse = async () => {

// }
module.exports = { findAll }