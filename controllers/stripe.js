const stripe = require('stripe')(process.env.STRIPE_SECRET_LIVE_KEY);
const endpointSecret = process.env.Signingsecret
const db = require("../models");
const botTelegram = require("../service/telegram_noti");

const { shareDriveViaOrder } = require('../service/sharedrive')

const createCheckOutSession = async (line_items, uuid, orderid, email) => {
    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: `https://india.fullbootcamp.com/order/${uuid}`,
        cancel_url: `https://india.fullbootcamp.com/order/${uuid}`,
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
                const url = `https://fullbootcamp.com/admin/order/${orderid}`;
                await botTelegram.sendMessage(
                    `Đơn hàng ${orderid} đã được thanh toán qua Stripe`,
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
module.exports = { createCheckOutSession, webhookStipe }