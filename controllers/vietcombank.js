const vietcombank = require('../service/vietcombank')
const moment = require("moment-timezone");

const vietcombankApi = async (req, res) => {
    try {
        const startDate = moment().tz("Asia/Bangkok").format("DD/MM/YYYY");
        const fromdate = req.query.fromdate || startDate;
        const todate = req.query.todate || startDate;
        const pageIndex = req.query.pageIndex || 0;
        const history = await vietcombank.getHistories(fromdate, todate, pageIndex);
        // console.log(history)
        if (history.status) {
            res.render("admin/bank/vietcombank", { data: history.data });
        } else {
            res.send(history.des);
        }
    } catch (error) {
        res.send(error)
    }

};


module.exports = {
    vietcombankApi,
};