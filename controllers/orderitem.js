const orderItem = require("../service/orderitem")

const update = async (req, res) => {
    const { orderid, id } = req.params
    const { status,driveDaGui,isOneDrive } = req.body
    const updateitem = await orderItem.update(id, status,driveDaGui,isOneDrive)
    res.redirect(`/admin/order/${orderid}`)
}

module.exports = { update }