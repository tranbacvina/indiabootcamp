const Routers = require("express").Router();
const vietcombank = require("../../controllers/vietcombank")
const momo = require("../../controllers/momo")
Routers.get("/vietcombank", vietcombank.vietcombankApi)
Routers.get("/momo", momo.getLSGD2)
Routers.get("/momo/detail", momo.getdetailTransaction)

module.exports = Routers;
