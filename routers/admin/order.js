const Routers = require("express").Router();
const order = require("../../controllers/order")

Routers.get('/', order.getorders)
Routers.get('/:id', order.oneOrder)


module.exports = Routers