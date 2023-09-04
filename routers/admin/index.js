const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const orderitem = require("./orderitem")

Routers.use("/course", course)
Routers.use("/order", order)
Routers.use("/orderitem", orderitem)




module.exports = Routers;
