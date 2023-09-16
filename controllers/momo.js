const db = require("../models");
const microtime = require("microtime");
const moment = require("moment-timezone");
const momo = require("../service/momo")

const getLSGD2 = async (req, res) => {
    const phone = req.body.phone || "0946645803";
    var startDate = moment().tz("Asia/Bangkok").startOf("day").format("X");
    var dateEnd = moment().tz("Asia/Bangkok").format("X");
    const begin = req.query.begin || startDate;
    const end = req.query.end || dateEnd;

    if (req.query.begin) {
        const [rerult1] = await db.sequelize.query(`SELECT * FROM lsgd WHERE lastUpdate BETWEEN ${begin} AND ${end} ORDER BY transId DESC`);
        const newRerult1 = rerult1.map((item) => {
            const lastUpdate1 = moment(item.lastUpdate).tz("Asia/Bangkok").format("DD/MM/YYYY HH:mm:ss");
            return { ...item, lastUpdate: lastUpdate1 };
            // res.render("admin/bank/momov2", {
            //     data: newRerult1,
            // });
        });
        res.send(newRerult1);
    } else {
        const [rerult] = await db.sequelize.query('SELECT * FROM lsgd ORDER BY transId DESC LIMIT 10');
        const newRerult = rerult.map((item) => {
            const lastUpdate = moment(item.lastUpdate).tz("Asia/Bangkok").format("DD/MM/YYYY HH:mm:ss");
            return { ...item, lastUpdate: lastUpdate };
        });
        // res.send(newRerult);
        res.render("admin/bank/momov2", {
            data: newRerult,
        });
    }
};

const getdetailTransaction = async (req, res) => {
    const { id } = req.query;
    console.log(req.query);
    const phone = req.body.phone || "0946645803";
    const Trans = await momo.detailTransaction(phone, id);
    res.send(Trans);
};

const index = async (req, res) => {
    res.render('admin/bank/paymentsetting')
}
const momo_send_opt = async (req, res) => {
    const { phone } = req.body
    console.log(phone)
    const send_otp_msg = await momo.SEND_OTP_MSG(phone)
    res.render('admin/bank/momo_opt', { send_otp_msg: send_otp_msg })

}

const momo_very_opt = async (req, res) => {
    const { phone, otp } = req.body

    await momo.ImportOTP(phone, otp)
    const data_reg_drive = await momo.REG_DEVICE_MSG(phone)
    res.render('admin/bank/momo_login', { data_reg_drive })
}

const momo_login = async (req, res) => {
    const { phone, password } = req.body
    const Login = await momo.LoginUser(phone, password)
    res.send(Login)
}
module.exports = {

    getLSGD2, getdetailTransaction, index, momo_send_opt, momo_very_opt, momo_login

};