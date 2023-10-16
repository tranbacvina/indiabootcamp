const Routers = require("express").Router();
const { check } = require('express-validator');
const order = require("../controllers/order")
const coinbase = require("../controllers/coinbase")

Routers.post("/createapi", [
    check('email', 'Please fill in your email').not().isEmpty(),
    check('email', 'Please fill in the correct email format').isEmail()
], order.createindia);

Routers.get("/", order.tracking)

Routers.get('/success', order.stripeSuccess);
Routers.get('/complete/:uuid', order.coinBaseSuccess);

// Tạo thanh toán stripe
Routers.post("/cstripe/:uuid", order.cstripe)
// Tạo thanh toán coinbase
Routers.post("/cscoinbase/:uuid", coinbase.createCharge)

Routers.get("/:uuid", order.getuuid)

module.exports = Routers