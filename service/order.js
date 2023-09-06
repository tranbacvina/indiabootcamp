const { query } = require("express");
const db = require("../models");
const { Op } = require("sequelize");
const orderUUID = async (uuid) => {
    return await db.order.findOne({
        where: {
            uuid
        },
        include: {
            model: db.orderItem,
            include: {
                model: db.course
            }
        }
    })
}

const findOne = async (id) => {
    const query = {
        include: {
            model: db.orderItem,
            include: {
                model: db.course
            }
        }
    }
    if (id) {
        query.where = { [Op.or]: [{ uuid: id }, { id: id }] }
    }
    const oneOrder = await db.order.findOne(
        query,
    )
    return oneOrder
}

const findMany = async (querys, limit, skip) => {
    const query = { limit: limit, offset: skip, order: [['id', 'DESC']] }

    if (querys) {
        query.where = { [Op.or]: [{ email: querys }, { uuid: querys }, { id: querys }] }
    }

    return await db.order.findAndCountAll(query)
}

// const findManyCourse_ChuaGui = async (id) => {
//     const query = {
//         attributes: ['id'],
//         order: [['id', 'DESC']],
//         include:
//             [{
//                 model: db.course,
//                 attributes: ['url', 'name'],
//             },
//             {
//                 model: db.order,
//                 where: { status: 'Paid' },
//                 attributes: ['id', 'email', 'createdAt'],
//             }],
//         where: { status: 'Chua gui' }
//     }
//     if (id) { query.where.orderID = id }

//     return await db.orderItem.findAll(
//         query,
//     )
// }

module.exports = { orderUUID, findMany, findOne, }