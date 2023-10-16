const { Client, resources, Webhook } = require("coinbase-commerce-node");
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;
const DOMAIN = process.env.EN_DOMAIN;
const db = require("../models");
const { shareDriveViaOrder } = require('../service/sharedrive')
const order = require('../service/order')
const botTelegram = require("../service/telegram_noti");


const { Charge } = resources;

Client.init(COINBASE_API_KEY);

const createCharge = async (req, res) => {
    const orderItem = await order.orderUUID(req.params.uuid)
    const chargeData = {
        name: `Payment orders ${orderItem.id}`,
        description: `${orderItem.email}`,
        local_price: {
            amount: `${(orderItem.priceus)/100}`,
            currency: "USD",
        },
        pricing_type: "fixed_price",
        metadata: {
            orderid: `${orderItem.id}`,
            orderuuid: `${orderItem.uuid}`,
            email: `${orderItem.email}`,
        },
        redirect_url: `${DOMAIN}/order/complete/${orderItem.uuid}`,
        cancel_url: `${DOMAIN}/order/${orderItem.uuid}`,
    };

    const charge = await Charge.create(chargeData);
    // console.log(charge)
    res.redirect(charge.hosted_url)
}

const webhookCoinbase = async (req, res) => {
    const rawBody = req.rawBody;
    const signature = req.headers["x-cc-webhook-signature"];
    const webhookSecret = COINBASE_WEBHOOK_SECRET;

    let event;

    try {
        event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);

        if (event.type === "charge:pending") {
            // received order
            // user paid, but transaction not confirm on blockchain yet
            console.log("pending payment");
        }

        if (event.type === "charge:confirmed" || event.type === "charge:resolved") {
            const OrderDetail = await db.order.findOne({
                where: {
                    id: event.data.metadata.orderid,
                    status: "Pending",
                },
            });
            if (OrderDetail) {
                const url = `${DOMAIN}/admin/order/${event.data.metadata.orderid}`;
                await botTelegram.sendMessage(
                    `Đơn hàng ${event.data.metadata.orderid} đã được thanh toán qua CoinBase`,
                    url
                );
                OrderDetail.status = "Paid";
                await OrderDetail.save();
                await shareDriveViaOrder(event.data.metadata.orderid);
            }
            console.log("charge confirme");
        }

        if (event.type === "charge:failed") {
            // cancel order
            // charge failed or expired
            console.log("charge failed");
        }

        res.send(`success ${event.id}`);
    } catch (error) {
        console.log(error);
        res.status(400).send("failure");
    }
};

module.exports = { createCharge, webhookCoinbase }