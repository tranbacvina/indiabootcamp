const Routers = require("express").Router();
const { check } = require('express-validator');
const order = require("../controllers/order")


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
    order.createvnapi
])
Routers.get('/success', order.stripeSuccess);
Routers.post("/cstripe", order.cstripe)
Routers.get("/:uuid", order.getuuid)
Routers.get("/", order.tracking)

module.exports = Routers