const db = require("../models");
const { Op } = require("sequelize");

const update = async (id, status,driveDaGui,isOneDrive) => {
    const orderItem = await db.orderItem.findOne({
        where: {
            id
        }
    })
    if (status) { orderItem.status = status }
    if (driveDaGui) { orderItem.driveDaGui = driveDaGui }
    if (isOneDrive) { orderItem.isOneDrive = isOneDrive }

    await orderItem.save()
    return orderItem
}

module.exports = { update }