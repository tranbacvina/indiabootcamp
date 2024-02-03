const moment = require("moment-timezone");
const crypto = require("crypto");
const axios = require("axios");
const BASE_URI = "https://mobile.mbbank.com.vn/retail_lite";
const db = require('../models');
require("dotenv").config();


const md5 = data => crypto.createHash("md5").update(data).digest("hex");

const username = '0946645803';
const password = 'Bactam1';
const accountNumber = '1282012345666';
const deviceIdCommon = 'gfl3l00m-mbib-0000-0000-2022090310591869'

const getcapcha = async () => {
    const refNo = `${moment().tz('Asia/Ho_Chi_Minh').format('YmdHms')}`;

    const capcha = await axios.post(
        'https://online.mbbank.com.vn/retail-web-internetbankingms/getCaptchaImage',
        {
            deviceIdCommon: deviceIdCommon,
            refNo,
            sessionId: "",
        }
        , {
            headers: commonHeader,
        })
    const capchaimage = capcha.data.imageString
    console.log(capchaimage)
    return capchaimage
}

const giaima_captcha = async (captcha) => {
    try {
        const capcha = await axios.post('http://ai.mggtd.com/captcha_v4',
            {
                image: captcha,
                model: 'mb'
            })
        console.log(capcha.data)
        return capcha.data.result
    } catch (error) {
        console.log(error)
    }

}

const commonHeader = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; Pixel XL Build/QP1A.191005.007.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.4183.101 Mobile Safari/537.36",
    Authorization: "Basic QURNSU46QURNSU4=",
    Deviceid: deviceIdCommon
};


const PostLogin = async (username, password, captcha_dec) => {

    const refNo = `${username}-${moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmssSS')}`;
    const bodyLogin = {
        refNo,
        userId: username,
        password: md5(password),
        sessionId: "",
        deviceIdCommon: deviceIdCommon,
        captcha: captcha_dec
    };
    const Login = await axios.post('https://online.mbbank.com.vn/retail_web/internetbanking/doLogin',
        bodyLogin, {
        headers: commonHeader,
    });
    if (!Login.data.result.ok) {
        return null
    }
    return Login.data.sessionId
}

const loginMBBANK = async () => {

    const captcha = await getcapcha()
    const captcha_dec = await giaima_captcha(captcha)
    const sessionId = await PostLogin(username, password, captcha_dec)
    const account = await db.BBank.findOne({
        where: { username: username }
    })
    account.token = sessionId
    await account.save()
    console.log('new sessionId Mbbank >>> ', sessionId)
    return sessionId

}

const getTransactions = async (begin, end) => {
    try {

       
        const { token, deviceId } = await db.BBank.findOne({ where: { username: username } })
        const refNobalance = `${accountNumber}-${moment().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmssSS")}`;
        const transactionList = await axios.post(
            'https://online.mbbank.com.vn/api/retail-transactionms/transactionms/get-account-transaction-history',
            {
              'accountNo': accountNumber,
              'fromDate': begin,
              'toDate': end,
              'sessionId': token,
              'refNo': refNobalance,
              'deviceIdCommon': deviceIdCommon
            },
            {
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'Authorization': 'Basic RU1CUkVUQUlMV0VCOlNEMjM0ZGZnMzQlI0BGR0AzNHNmc2RmNDU4NDNm',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': '_fbp=fb.2.1706758824325.1473771162; _gid=GA1.3.933377160.1706758824; _ga_R3XMN343KH=GS1.3.1706758824.1.0.1706758824.60.0.0; BIGipServerk8s_online_banking_pool_9712=3424387338.61477.0000; BIGipServerk8s_KrakenD_Api_gateway_pool_10781=3424387338.7466.0000; _ga=GA1.1.957045981.1706758824; _gat_gtag_UA_205372863_2=1; _ga_T1003L03HZ=GS1.1.1706758842.1.1.1706761180.0.0.0; MBAnalyticsaaaaaaaaaaaaaaaa_session_=LNBMBFLGOPJNJKPGPGOJLOMBFEGKDFINGAJDOABGBCIOCGGMFGMELIMPANIIEJPBCJODOKDMOLCHDEDJKDMACLKIJBICHNKNJBAHBBNCEFAGLHCHCOAOGMNGJGPNPOMD; JSESSIONID=E0F172536AD29D9EDFF87E268F56069D',
                'Deviceid': deviceIdCommon,
                'Origin': 'https://online.mbbank.com.vn',
                'RefNo': refNobalance,
                'Referer': 'https://online.mbbank.com.vn/information-account/source-account',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'X-Request-Id': '0946645803-2024020111201139',
                'elastic-apm-traceparent': '00-8ef56e5ddd4b90161e8fde19c51c7379-a6f8ef50bde11c1d-01',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
              }
            }
          );
       
        if (!transactionList.data.result.ok) {
            console.log(`Message: ${transactionList.data.result.message}, responseCode:  ${transactionList.data.result.responseCode}`)
            if (transactionList.data.result.responseCode == 'GW200') {
                console.log('Token - Die - Reload')
                await loginMBBANK()
            }
            return null
        }
        const transactionHistoryList = transactionList.data.transactionHistoryList;
        //     const balance = balanceResult.data.totalBalanceEquivalent
        // console.log(transactionHistoryList)
        return transactionHistoryList
        // }


    } catch (error) {
        console.log(error)
    }

}

const getLSGD = async (req, res) => {
    const default_date = moment().tz("Asia/Ho_Chi_Minh").format('DD/MM/YYYY');

    const begin = req.query.fromdate || default_date;
    const end = req.query.todate || default_date;
    const  transactionHistoryList = await getTransactions(begin, end);
   
    res.render('admin/bank/mbbank', { begin: begin, end: end, data: transactionHistoryList, })

};

module.exports = {
    getTransactions,
    getLSGD,
};

// loginMBBANK('0946645803', 'Maiyeu3m')
// const main = async () => {
//     await getTransactions('02/01/2024','02/01/2024')
// }

// main()