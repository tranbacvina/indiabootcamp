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
const update = async(data,id) => {
    const { name, slug, seotitle, seodescription,parent_id } = data
    const update = await db.Topic.update({
        name: name,
        slug: slug, seotitle, seodescription,parent_id
    }, {
        where: {
            id
        }
    })
    return update
}
// const findAllwithCourse = async () => {

// }
module.exports = {update, findAll, findOne ,findAllTopicChild,removeTopic}