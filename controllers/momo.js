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

module.exports = {

    getLSGD2, getdetailTransaction

};