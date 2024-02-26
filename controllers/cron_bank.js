const db = require("../models");
const moment = require("moment-timezone");
const momo = require("../service/momo");
const botTelegram = require("../service/telegram_noti");
const vietcombank = require("../service/vietcombank")
const mbbank = require("./mbbank")
const sharedrive = require("../service/sharedrive")

const check_regex_bank = (str) => {
    var pattern = /(bootcamp)\s([0-9]{0,})|(bootcamp)([0-9]{0,})/i;
    var result = pattern.test(str);
    var match = str.match(pattern);
    return { result, match };
};

const handle_transactions = async (Amount, Description) => {
    const { result, match } = check_regex_bank(Description);
    if (result) {
        const OrderID = match[2] || match[4];
        const creditAmount = Amount;

        const OrderDetail = await db.order.findOne({
            where: {
                id: OrderID,
                status: "Chua thanh toan",
            },
        });
        if (OrderDetail) {
            const url = `https://fullbootcamp.com/admin/order/${OrderID}`;
            await botTelegram.sendMessage(
                `Đơn hàng ${OrderID} đã được thanh toán ${creditAmount}`,
                url
            );
            if (creditAmount >= OrderDetail.price) {
                OrderDetail.status = "Paid";
                OrderDetail.priceck = creditAmount;
                await OrderDetail.save();
                await sharedrive.shareDriveViaOrder(OrderID);
            }
        }
    }
};

const converToNumber = (Amount) => {
    let newAmount = Amount.replace(",", "");
    return Number(newAmount);
};

const cronMOMOv2 = async () => {
    const startdateMOMO = moment().startOf("day").format("X");
    const nowdateMOMO = moment().format("X");
    const LSGDmomos = await momo.QUERY_TRAN_HIS_MSG(
        "0946645803",
        startdateMOMO,
        nowdateMOMO
    );

    for (let i of LSGDmomos) {
        const {
            transId,
            serviceId,
            lastUpdate,
            totalAmount,
            totalOriginalAmount,
            sourceId,
            sourceName,
            postBalance,
        } = i;
        const [results] = await db.sequelize.query(
            `SELECT * FROM lsgd where transId = ${transId}`
        );
        ///Xử lý Giao dịch mới
        if (results.length === 0) {
            ///Lấy nội dung chuyển khoản
            const noidung = await momo.detailTransaction("0946645803", transId);
            /// Lứu giao dịch vào database
            await db.sequelize.query(
                `INSERT INTO lsgd (transId,serviceId,lastUpdate,totalAmount,totalOriginalAmount,sourceId,sourceName,postBalance,noidung) values (${transId},'${serviceId}',${lastUpdate},${totalAmount},${totalOriginalAmount},${sourceId},'${sourceName}',${postBalance},'${noidung.COMMENT_VALUE}');`
            );
            await botTelegram.sendMessage2(
                `MOMO: +${totalAmount} từ ${sourceName} - ${sourceId}. ND: ${noidung.COMMENT_VALUE}. Số dư: ${postBalance}`
            );
            /// Check nội dung chuyển khoản, nếu match với đơn hàng cú pháp thì hoàn thành đơn, gửi email + gửi tin nhắn về telegram
            // const { result, match } = check_regex_bank(noidung);
            // if (result) {
            //   const OrderID = match[2] || match[4];
            //   const creditAmount = totalAmount;

            //   const OrderDetail = await db.order.findOne({
            //     where: {
            //       id: OrderID,
            //       status: "Pending",
            //     },
            //   });
            //   if (OrderDetail) {
            //     const url = `https://fullbootcamp.com/admin/order/${OrderID}`;
            //     await botTelegram.sendMessage(
            //       `Đơn hàng ${OrderID} đã được thanh toán ${creditAmount}`,
            //       url
            //     );
            //     if (creditAmount >= OrderDetail.price) {
            //       OrderDetail.status = "Paid";
            //       OrderDetail.priceck = creditAmount;
            //       await OrderDetail.save();
            //       await shareDriveViaOrder(OrderID);
            //     }
            //   }
            // }

            await handle_transactions(totalAmount, noidung.COMMENT_VALUE);
        }
    }
};
const cronVietcombank = async () => {
    const fromdate = moment().subtract(2, 'd').format("DD/MM/YYYY");
    const todate = moment().format("DD/MM/YYYY");
    const lsgdVietCombank = await vietcombank.getHistories(
        fromdate,
        todate,
        0
    );
    if (lsgdVietCombank.status) {
        for (let i of lsgdVietCombank.data.transactions) {
            const { Amount, Description } = i;
            /// Check nội dung chuyển khoản, nếu match với đơn hàng cú pháp thì hoàn thành đơn, gửi email + gửi tin nhắn về telegram
            await handle_transactions(converToNumber(Amount), Description);
        }
    }
};
const cronMB = async () => {
    console.log('check bank mb')
    const fromdate = moment().subtract(2, 'd').format("DD/MM/YYYY");
    const todate = moment().format("DD/MM/YYYY");
    const lsgdMB = await mbbank.getTransactions(
        fromdate,
        todate,
    );
    if (lsgdMB !== null) {
        for (let i of lsgdMB) {
            const { creditAmount, description } = i;
            /// Check nội dung chuyển khoản, nếu match với đơn hàng cú pháp thì hoàn thành đơn, gửi email + gửi tin nhắn về telegram
            await handle_transactions(converToNumber(creditAmount), description);
        }
    }

};

const cron = async () => {
    // try {
    //     await cronMB()
        
    // } catch (error) {
    //     console.log(error);
    // }
    try {
        await cronVietcombank();
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    cron,
};