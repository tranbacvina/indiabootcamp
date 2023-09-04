const Routers = require("express").Router();
const orderitem = require("../../controllers/orderitem")

Routers.post('/orderid/:orderid/id/:id', orderitem.update)
module.exports = Routers
