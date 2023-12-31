const stripe = require('stripe')('sk_test_51NT8FIHB0jT9ge3wkM5zhk26D2M8yt1OR0qkcjN0UMsyXE6MfIFlPE4o1Im0Oagb5WKP4pO0rkMW0qgw9XJVmDzs0027ubxzz1');
const endpointSecret = "whsec_8017e25955ec281120d71e7df71fb710b746d70c03217759ad65a2cf4cc3c0b5";
const db = require("../models");
const botTelegram = require("./telegram_noti");

const { shareDriveViaOrder } = require('./sharedrive')

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