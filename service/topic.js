const db = require("../models")

const findAll = async () => {
    const allTopics = await db.Topic.findAll()
    return allTopics
}
const findOne = async (slug) => {
    const allTopics = await db.Topic.findOne({
        where: {
            slug
        }
    })
    return allTopics
}

// const findAllwithCourse = async () => {

// }
module.exports = { findAll, findOne }