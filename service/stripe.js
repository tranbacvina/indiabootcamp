const stripe = require('stripe')(process.env.STRIPE_SECRET_LIVE_KEY);
const endpointSecret = process.env.Signingsecret;
const db = require("../models");
const botTelegram = require("./telegram_noti");
const DOMAIN = process.env.DOMAIN;
const { shareDriveViaOrder } = require('./sharedrive')

const createCheckOutSession = async (line_items, uuid, orderid, email) => {
    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: `${DOMAIN}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}/order/${uuid}`,
        customer_email: email,
        metadata: {
            orderid
        }

    });
    return session.url
}

const webhookStipe = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }


    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const orderid = event.data.object.metadata.orderid
            const OrderDetail = await db.order.findOne({
                where: {
                    id: orderid,
                    status: "Chua thanh toan",
                },
            });
            if (OrderDetail) {
                const url = `${DOMAIN}/admin/order/${orderid}`;
                await botTelegram.sendMessage(
                    `Đơn hàng ${orderid} đã được thanh toán qua Stripe US`,
                    url
                );
                OrderDetail.status = "Paid";
                await OrderDetail.save();
                await shareDriveViaOrder(orderid);
            }
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
};

const striperetrieve = async (id) => {
    const session = await stripe.checkout.sessions.retrieve(id);
    return session
}
module.exports = { createCheckOutSession, webhookStipe, striperetrieve }