const db = require("../models");

const findMany = async (text, limit, skip) => {
    const query = {
        limit: limit,
        offset: skip,
        order: [['id', 'DESC']],
        include: { model: db.Category }
    }
    if (text) {
        query['where'] = {
            [Op.or]: [

                { name: { [Op.like]: `%${text}%` } },
                { url: text }
            ]
        }
    }

    return await db.Blog.findAndCountAll(query)
}


const findOne = async (id) => {
    return await db.Blog.findOne({ where: { id } })
}
module.exports = { findMany, findOne }