
const db = require("../models");
const stripe = require("../service/stripe")
const order = require("../service/order")
const { oneCourseID, findManyCourse_ChuaGui } = require("../service/course")
const { check } = require('express-validator');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require("uuid");
const paginate = require('express-paginate');

const createindia = async (req, res) => {
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
        const line_items = orderItem.map((item) => {
            return {
                quantity: 1,
                price_data:
                {
                    currency: "INR",
                    unit_amount: item.priceindia,
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },

                },

            }

        })
        const urlStripeCheckOut = await stripe.createCheckOutSession(line_items, order.uuid, order.id, email)

        res.status(200).json({ order, urlStripeCheckOut });
    } catch (error) {
        console.error(error);
    }
};

const getuuid = async (req, res) => {
    const { uuid } = req.params;
    const orderid = await order.findOne(uuid)
    if (orderid) {
        res.render('order/oneOrder', { order: orderid })
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
        const orders = await order.findMany(query, limit, skip)
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
    const { query, limit, skip } = req.query
    const orders = await order.findMany(query, limit, skip)
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
                    currency: "INR",
                    unit_amount: item.course.priceindia,
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
module.exports = { createindia, oneOrder, getuuid, tracking, getorders, cstripe, }