const Routers = require("express").Router();
const { check } = require('express-validator');
const order = require("../controllers/order")
const coinbase = require("../controllers/coinbase")


Routers.post("/createapi", [
    check('email', 'Không được để trống email').not().isEmpty(),
    check('email', 'Vui lòng điền đúng định dạng email').isEmail()
], order.createindia);
Routers.post("/createvn", [
    check('email', 'Không được để trống email').not().isEmpty(),
    check('email', 'Vui lòng điền đúng định dạng email').isEmail(),
    check('courseID', 'Không được để trống Course').not().isEmpty(),
    order.createVN
])
Routers.post("/createvnapi", [
    check('email', 'Không được để trống email').not().isEmpty(),
    check('email', 'Vui lòng điền đúng định dạng email').isEmail(),
    check('items', 'Đơn hàng chưa có khoá học, vui lòng thực hiện lại').not().isEmpty(),
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