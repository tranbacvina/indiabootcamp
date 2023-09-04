const orderItem = require("../service/orderitem")

const update = async (req, res) => {
    const { orderid, id } = req.params
    const { status } = req.body
    const updateitem = await orderItem.update(id, status)
    res.redirect(`/admin/order/${orderid}`)
}

module.exports = { update }