const Routers = require("express").Router();
const order = require("../../controllers/order")

Routers.get('/', order.getorders)
Routers.get('/needdowwnload/:id', order.needdowwnload)
Routers.get('/:id', order.oneOrder)
Routers.post('/:id', order.updateOrder)


module.exports = Routers