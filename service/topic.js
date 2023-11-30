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

const findAllTopicChild = async(parent_id) => {
    return await db.Topic.findAll({
        where: {
            parent_id 
        }
    })
}
const removeTopic = async (id) => {
     const topic = await db.Topic.findOne({
        where:{
            id
        }
    })
    await topic.setCourses([])
    return await db.Topic.destroy({
        where: {
            id
        }
    })
}
// const findAllwithCourse = async () => {

// }
module.exports = { findAll, findOne ,findAllTopicChild,removeTopic}