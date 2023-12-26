const db = require("../models");

const findMany = async (text, page, isAdmin, slugCate) => {
    // const query = {
    //     limit: limit,
    //     offset: skip,
    //     order: [['id', 'DESC']],
    //     include: { model: db.Category },
    //     where:{isDeleted:false}
    // }
    // if (text) {
    //     query['where'] = {
    //         [Op.or]: [

    //             { name: { [Op.like]: `%${text}%` } },
    //             { url: text }
    //         ]
    //     }
    // }

    // return await db.Blog.findAndCountAll(query)
    const limit = 36
    const skip = (limit * page) - limit
    const query = {
        limit: limit,
        offset: skip,
        order: [['updatedAt', 'DESC']],
        include: { model: db.Category },
        where: {
            isDeleted: false
        }
       
    }
    if (text) {
        query['where'] = {
            [Op.or]: [

                { name: { [Op.like]: `%${text}%` } },
            ]
        }
    }
    if (isAdmin){
        delete query.where
    }

    if(slugCate){
        query.include = {
            model: db.Category, 
            where: {
                slug:slugCate
            }}
    }
 
    return await db.Blog.findAndCountAll(query)
}


const findOne = async (id) => {
    return await db.Blog.findOne({ where: { id }, include: [{ model: db.course},{model: db.Category}] })
}

const findManyByCategories = async (text, limit, skip, slug) => {
    const query = {
        limit: limit,
        offset: skip,
        order: [['id', 'DESC']],
        include: {
            model: db.Category, where: {
                slug
            }
        },
        where: {
            isDeleted:false
        }
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
module.exports = { findMany, findOne, findManyByCategories }