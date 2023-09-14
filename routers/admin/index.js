const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const orderitem = require("./orderitem")
const vietcombank = require("../../controllers/vietcombank")


Routers.use("/course", course)
Routers.use("/order", order)
Routers.use("/orderitem", orderitem)
Routers.get("/vietcombank", vietcombank.vietcombankApi)




module.exports = Routers;
