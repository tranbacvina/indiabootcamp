const db = require("../models");
const { Op } = require("sequelize");

const update = async (id, status) => {
    const orderItem = await db.orderItem.findOne({
        where: {
            id
        }
    })
    if (status) { orderItem.status = status }

    await orderItem.save()
    return orderItem
}

module.exports = { update }