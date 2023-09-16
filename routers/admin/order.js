const Routers = require("express").Router();
const order = require("../../controllers/order")

Routers.get('/', order.getorders)
Routers.get('/:id', order.oneOrder)
Routers.post('/:id', order.updateOrder)


module.exports = Routers