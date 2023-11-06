const Routers = require("express").Router();
const { check } = require('express-validator');
const order = require("../controllers/order")
const coinbase = require("../controllers/coinbase")


Routers.post("/createapi", [
    check('email', 'Email cannot be left blank').not().isEmpty(),
    check('email', 'Please fill in the correct email format').isEmail()
], order.createindia);
Routers.post("/createvn", [
    check('email', 'Email cannot be left blank').not().isEmpty(),
    check('email', 'Please fill in the correct email format').isEmail(),
    check('courseID', 'Course cannot be left blank').not().isEmpty(),
    order.createVN
])
Routers.post("/createvnapi", [
    check('email', 'Email cannot be left blank').not().isEmpty(),
    check('email', 'Please fill in the correct email format').isEmail(),
    order.createvnapi
])
Routers.get('/success', order.stripeSuccess);
Routers.get('/complete/:uuid', order.coinBaseSuccess);

// Tạo thanh toán stripe
Routers.post("/cstripe/:uuid", order.cstripe)
// Tạo thanh toán coinbase
Routers.post("/cscoinbase/:uuid", coinbase.createCharge)
Routers.get("/:uuid", order.getuuid)
Routers.get("/", order.tracking)

module.exports = Routers