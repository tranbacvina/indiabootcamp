const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const orderitem = require("./orderitem")
const bank = require("./bank")
const topic = require("./topic")

Routers.use("/course", course)
Routers.use("/order", order)
Routers.use("/orderitem", orderitem)
Routers.use("/bank", bank)
Routers.use("/topic", topic)






module.exports = Routers;
