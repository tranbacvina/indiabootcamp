
const db = require("../models");
const stripe = require("../service/stripe")
const order = require("../service/order")
const { oneCourseID, findManyCourse_ChuaGui } = require("../service/course")
const { check } = require('express-validator');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require("uuid");
const paginate = require('express-paginate');
const axios = require('axios')
const courseService = require("../service/course")
const facebookPixel = require("../service/facebook_pixel")
var ip = require('ip');


const createindia = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const { email, items } = req.body;
        const client_user_agent = req.useragent.source
        const ipClien = ip.address()


        const orderItem = [];
        for (let item of items) {
            const Course = await oneCourseID(item.courseID)
            orderItem.push(Course);
        }

        const price = orderItem.reduce((acc, obj) => acc + obj.price, 0)
        const priceindia = orderItem.reduce((acc, obj) => acc + obj.priceindia || 9900, 0)
        const priceus = orderItem.reduce((acc, obj) => acc + obj.priceus || 300, 0)

        const order = await db.order.create(
            {
                email,
                price,
                priceck: 0,
                priceindia,
                priceus,
                status: "Chua thanh toan",
                orderItems: items,
                uuid: uuidv4()
            },
            {
                include: {
                    model: db.orderItem,
                    include: {
                        model: db.course
                    }
                },
            }
        );
        const line_items = orderItem.map((item) => {
            return {
                quantity: 1,
                price_data:
                {
                    currency: "USD",
                    unit_amount: item.priceus,
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },

                },

            }

        })
        const urlStripeCheckOut = await stripe.createCheckOutSession(line_items, order.uuid, order.id, email)
        const fbc = req.cookies._fbc
        const fbp = req.cookies._fbp
        const sendApiFacebook = await facebookPixel.newEvenSendToFacebook(email, price, ipClien, client_user_agent, fbc, fbp)
        res.status(200).json({ order, urlStripeCheckOut });
    } catch (error) {
        console.error(error);
    }
};

const createVN = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const { email, courseID } = req.body;
        let items = new Array(courseID)
        const orderItem = [];
        for (let item of items) {
            const Course = await oneCourseID(item)
            orderItem.push(Course);
        }
        console.log('items', items)
        console.log('orderItem', orderItem)

        const price = orderItem.reduce((acc, obj) => acc + obj.price, 0)
        const priceindia = orderItem.reduce((acc, obj) => acc + obj.priceindia || 9900, 0)
        const priceus = orderItem.reduce((acc, obj) => acc + obj.priceus || 300, 0)

        const order = await db.order.create(
            {
                email,
                price,
                priceck: 0,
                priceindia,
                priceus,
                status: "Chua thanh toan",
                orderItems: items.map(i => { return { courseID: i } }),
                uuid: uuidv4()
            },
            {
                include: {
                    model: db.orderItem,
                    include: {
                        model: db.course
                    }
                },
            }
        );
        const client_user_agent = req.useragent.source
        const ipClien = ip.address()
        const fbc = req.cookies._fbc
        const fbp = req.cookies._fbp
        const sendApiFacebook = await facebookPixel.newEvenSendToFacebook(email, price, ipClien, client_user_agent, fbc, fbp)

        res.redirect(`/order/${order.uuid}`)
    } catch (error) {
        console.error(error);
    }
};

const createvnapi = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const { email, items } = req.body;

        const orderItem = [];
        for (let item of items) {
            const Course = await oneCourseID(item.courseID)
            orderItem.push(Course);
        }

        const price = orderItem.reduce((acc, obj) => acc + obj.price, 0)
        const priceindia = orderItem.reduce((acc, obj) => acc + obj.priceindia || 9900, 0)
        const priceus = orderItem.reduce((acc, obj) => acc + obj.priceus || 300, 0)

        const order = await db.order.create(
            {
                email,
                price,
                priceck: 0,
                priceindia,
                priceus,
                status: "Chua thanh toan",
                orderItems: items,
                uuid: uuidv4()
            },
            {
                include: {
                    model: db.orderItem,
                    include: {
                        model: db.course
                    }
                },
            }
        );

        const client_user_agent = req.useragent.source
        const ipClien = ip.address()
        const fbc = req.cookies._fbc
        const fbp = req.cookies._fbp
        const sendApiFacebook = await facebookPixel.newEvenSendToFacebook(email, price, ipClien, client_user_agent, fbc, fbp)

        res.status(200).json({ url: `/order/${order.uuid}` });
    } catch (error) {
        console.error(error);
    }
};

const getuuid = async (req, res) => {
    const { uuid } = req.params;
    const orderid = await order.orderUUID(uuid)
    const qrcode = await axios.post('https://api.vietqr.io/v2/generate', {
        "accountNo": "0141000836982",
        "accountName": "TRAN DUY BAC",
        "acqId": "970436",
        "addInfo": `bootcamp ${orderid.id}`,
        "amount": `${orderid.price}`,
        "template": "qr_only"
    })
    // res.send(qrcode.data)
    if (orderid) {
        res.render('order/oneOrder', { order: orderid, qrcode: qrcode.data })
    } else {
        res.render('layout/404')
    }

}
const oneOrder = async (req, res) => {
    const { id } = req.params
    try {
        const OneOrder = await order.findOne(id)


        const courseChuaGui = await findManyCourse_ChuaGui(id)

        if (OneOrder) {
            res.render('admin/order/order_deltail', { OneOrder: OneOrder, courseChuaGui: courseChuaGui })
        } else (
            res.redirect('/admin/order')
        )
    } catch (error) {

    }
}
const tracking = async (req, res) => {
    const { query, limit, skip } = req.query
    if (query) {
        const orders = await order.findMany(query, limit, req.skip)
        if (orders.length === 0) {

            res.render('layout/404')
        } else {
            const itemCount = orders.count;
            const pageCount = Math.ceil(orders.count / req.query.limit);
            res.render('order/orders', {
                orders: orders.rows,
                pageCount,
                itemCount,
                currentPage: req.query.page,
                pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
            });

        }
    } else {
        res.render('order/tracking')
    }

}

const getorders = async (req, res) => {
    const { query, limit } = req.query
    const orders = await order.findMany(query, limit, req.skip)
    if (orders.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = orders.count;
        const pageCount = Math.ceil(orders.count / req.query.limit);
        res.render('admin/order/order', {
            orders: orders.rows,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
        });

    }

}

const cstripe = async (req, res) => {
    try {
        const uuid = req.body.uuid
        const orderItems = await order.findOne(uuid)
        const line_items = orderItems.orderItems.map((item) => {
            return {
                quantity: 1,
                price_data:
                {
                    currency: "USD",
                    unit_amount: item.course.priceus,
                    product_data: {
                        name: item.course.name,
                        images: [item.course.image],
                    },

                },

            }

        })
        const urlStripeCheckOut = await stripe.createCheckOutSession(line_items, orderItems.uuid, orderItems.id, orderItems.email)
        res.redirect(urlStripeCheckOut)
    } catch (error) {
        console.log(error)
        res.render('layout/505')
    }


}

const stripeSuccess = async (req, res) => {
    const session = await stripe.striperetrieve(req.query.session_id);
    const orderid = session.metadata.orderid
    const orderdata = await order.findOne(orderid)
    res.render('order/order_success', { order: orderdata });
}

const updateOrder = async (req, res) => {
    const { id } = req.params
    const updateOder = req.body
    console.log(updateOder)
    try {
        const orderupdate = await order.updateOrder(id, updateOder)

        res.redirect(`/admin/order/${id}`)

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const needdowwnload = async (req, res) => {
    const { id } = req.params
    let links = await findManyCourse_ChuaGui(id)
    links = links.map(item => { return item.course.url })
    res.send(links)
}
module.exports = { needdowwnload, createvnapi, updateOrder, createindia, oneOrder, getuuid, tracking, getorders, cstripe, stripeSuccess, createVN }