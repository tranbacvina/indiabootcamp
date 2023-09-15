const db = require("../models");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const microtime = require("microtime");
var CryptoJS = require("crypto-js");
const moment = require("moment-timezone");
const util = require("util");

const app = {
    appVer: 40221,
    appCode: "4.0.22",
}

const LoadData = async (phone) => {
    try {
        var [select] = await db.sequelize.query(
            `SELECT * FROM cron_momo where phone = ${phone}`
        );

        // if (select.length > 0) {
        //     await db.sequelize.query(`UPDATE cron_momo SET agent_id = 'underfined',
        //     sessionkey = '',
        //     authorization = 'underfined' WHERE phone = '${phone}'  `)
        // } 
        // else {
        // const [device] = await db.sequelize.query(`SELECT * FROM device ORDER BY RAND() LIMIT 1`)
        // await db.sequelize.query(`INSERT INTO cron_momo
        // SET phone = '${phone}',
        // imei = '${uuidv4()}',
        // SECUREID = '${generateId(17)}',
        // rkey = '${generateId(20)}',
        // AAID =  '${uuidv4()}',
        // TOKEN = '${get_TOKEN()}',
        // device = '${device[0]["device"]}',
        // hardware = '${device[0]["hardware"]}',
        // facture = '${device[0]["facture"]}',
        // MODELID = '${device[0]["MODELID"]}'`)
        // }
        // var [select2] = await db.sequelize.query(`SELECT * FROM cron_momo where phone = '${phone}'`)

        return select[0];
    } catch (error) {
        console.log(error);
    }
};

function generateId(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function get_TOKEN() {
    const token = `${generateId(22)}:${generateId(9)}-${generateId(
        20
    )}-${generateId(12)}-${generateId(7)}-${generateId(7)}-${generateId(
        53
    )}-${generateId(9)}_${generateId(11)}-${generateId(4)}`;
    return token;
}

async function SEND_OTP_MSG(phoneNumber) {
    try {
        const item = await LoadData(phoneNumber);
        const {
            id,
            phone,
            password,
            Name,
            imei,
            AAID,
            TOKEN,
            ohash,
            SECUREID,
            rkey,
            rowCardId,
            authorization,
            agent_id,
            setupKeyDecrypt,
            setupKey,
            sessionkey,
            RSA_PUBLIC_KEY,
            REFRESH_TOKEN,
            BALANCE,
            device,
            hardware,
            facture,
            MODELID,
        } = item;
        await CHECK_USER_BE_MSG(
            phone,
            imei,
            AAID,
            TOKEN,
            SECUREID,
            rkey,
            device,
            hardware,
            facture,
            MODELID
        );

        const header = {
            agent_id: "undefined",
            sessionkey: "",
            user_phone: "undefined",
            authorization: "Bearer undefined",
            msgtype: "SEND_OTP_MSG",
            Host: "api.momo.vn",
            "User-Agent": "okhttp/3.14.17",
            app_version: app.appVer,
            app_code: app.appCode,
            device_os: "Android",
        };
        const micro_time = microtime.now();
        const Data = {
            user: phone,
            msgType: "SEND_OTP_MSG",
            cmdId: micro_time + "000000",
            lang: "vi",
            time: micro_time,
            channel: "APP",
            appVer: app.appVer,
            appCode: app.appCode,
            deviceOS: "ANDROID",
            buildNumber: 0,
            appId: "vn.momo.platform",
            result: true,
            errorCode: 0,
            errorDesc: "",
            momoMsg: {
                _class: "mservice.backend.entity.msg.RegDeviceMsg",
                number: phone,
                imei: imei,
                cname: "Vietnam",
                ccode: "084",
                device: device,
                firmware: "23",
                hardware: hardware,
                manufacture: facture,
                csp: "",
                icc: "",
                mcc: "",
                device_os: "Android",
                secure_id: SECUREID,
            },
            extra: {
                action: "SEND",
                rkey: rkey,
                AAID: AAID,
                IDFA: "",
                TOKEN: TOKEN,
                SIMULATOR: "",
                SECUREID: SECUREID,
                MODELID: MODELID,
                isVoice: false,
                REQUIRE_HASH_STRING_OTP: true,
                checkSum: "",
            },
        };

        const SEND_OTP_MSG = await axios({
            method: "post",
            url: "https://api.momo.vn/backend/otp-app/public/",
            data: Data,
            headers: header,
        });
        console.log(SEND_OTP_MSG.data);
        return SEND_OTP_MSG.data;
    } catch (error) {
        console.log(error);
    }
}

async function CHECK_USER_BE_MSG(phoneNumber) {
    try {
        const item = await LoadData(phoneNumber);
        const {
            id,
            phone,
            password,
            Name,
            imei,
            AAID,
            TOKEN,
            ohash,
            SECUREID,
            rkey,
            rowCardId,
            authorization,
            agent_id,
            setupKeyDecrypt,
            setupKey,
            sessionkey,
            RSA_PUBLIC_KEY,
            REFRESH_TOKEN,
            BALANCE,
            device,
            hardware,
            facture,
            MODELID,
        } = item;
        const header = {
            Host: "api.momo.vn",
            Sessionkey: "",
            Userid: "",
            Msgtype: "CHECK_USER_BE_MSG",
            User_phone: "",
            App_code: app.appCode,
            App_version: app.appVer,
            "User-Agent": "Ktor client",
            Lang: "vi",
            Channel: "APP",
            "Momo-Session-Key-Tracking": imei,
            Device_os: "ANDROID",
            Agent_id: 0
        };
        const micro_time = microtime.now();
        const Data = {
            user: phone,
            msgType: "CHECK_USER_BE_MSG",
            momoMsg: {
                _class: "mservice.backend.entity.msg.RegDeviceMsg",
                number: phone,
                imei: imei,
                cname: "Vietnam",
                ccode: "084",
                device: device,
                firmware: "23",
                hardware: hardware,
                manufacture: facture,
                csp: "Viettel",
                icc: "",
                mcc: "452",
                mnc: "01",
                device_os: "Android",
                secure_id: SECUREID,
            },
            appVer: app.appVer,
            appCode: app.appCode,
            lang: "vi",
            deviceOS: "ANDROID",
            channel: "APP",
            buildNumber: 0,
            appId: "vn.momo.platform",
            cmdId: micro_time + "000000",
            time: micro_time,
        };

        const CHECK_USER_BE_MSG = await axios({
            method: "post",
            url: "https://api.momo.vn/backend/auth-app/public/CHECK_USER_BE_MSG",
            data: Data,
            headers: header,
        });
        console.log(CHECK_USER_BE_MSG.data);
        return CHECK_USER_BE_MSG.data;
    } catch (error) {
        console.log(error);
    }
}

async function ImportOTP(phone, otp) {
    const item = await LoadData(phone);
    const rkey = item.rkey;
    var ohash = `${phone}${rkey}${otp}`;
    var hash = CryptoJS.SHA256(ohash);
    hash = hash.toString(CryptoJS.enc.Hex);

    await db.sequelize.query(
        `UPDATE cron_momo SET ohash = "${hash}" WHERE phone = "${phone}"  `
    );
}

async function REG_DEVICE_MSG(phoneMOMO) {
    const item = await LoadData(phoneMOMO);
    const {
        id,
        phone,
        password,
        Name,
        imei,
        AAID,
        TOKEN,
        ohash,
        SECUREID,
        rkey,
        rowCardId,
        authorization,
        agent_id,
        sessionkey,
        RSA_PUBLIC_KEY,
        REFRESH_TOKEN,
        BALANCE,
        device,
        hardware,
        facture,
        MODELID,
    } = item;
    const header = {
        agent_id: "undefined",
        sessionkey: "",
        user_phone: "undefined",
        authorization: "Bearer undefined",
        msgtype: "REG_DEVICE_MSG",
        Host: "api.momo.vn",
        "User-Agent": "okhttp/3.14.17",
        appVer: app.appVer,
        appCode: app.appCode,
        device_os: "ANDROID",
    };
    const micro_time = microtime.now();
    const Data = {
        user: phone,
        msgType: "REG_DEVICE_MSG",
        cmdId: micro_time + "000000",
        lang: "vi",
        time: micro_time,
        channel: "APP",
        appVer: app.appVer,
        appCode: app.appCode,
        deviceOS: "ANDROID",
        buildNumber: 0,
        appId: "vn.momo.platform",
        result: true,
        errorCode: 0,
        errorDesc: "",
        momoMsg: {
            _class: "mservice.backend.entity.msg.RegDeviceMsg",
            number: phone,
            imei: imei,
            cname: "Vietnam",
            ccode: "084",
            device: device,
            firmware: "23",
            hardware: hardware,
            manufacture: facture,
            csp: "",
            icc: "",
            mcc: "",
            device_os: "Android",
            secure_id: SECUREID,
        },
        extra: {
            ohash: ohash,
            AAID: AAID,
            IDFA: "",
            TOKEN: TOKEN,
            SIMULATOR: "",
            SECUREID: SECUREID,
            MODELID: MODELID,
            checkSum: "",
        },
    };
    const REG_DEVICE_MSG = await axios({
        method: "post",
        url: "https://api.momo.vn/backend/otp-app/public/",
        data: Data,
        headers: header,
    });
    console.log(REG_DEVICE_MSG.data);

    const setupKey = REG_DEVICE_MSG.data.extra.setupKey;
    const setupKeyDecrypt = get_setupKey(setupKey, ohash);
    await db.sequelize.query(`UPDATE cron_momo SET setupKey = '${setupKey}',
    setupKeyDecrypt = '${setupKeyDecrypt}' WHERE phone =  '${phone}' `);
    return REG_DEVICE_MSG.data;
}

function get_setupKey(setupKey, ohash) {
    const key = CryptoJS.enc.Utf8.parse(ohash.substr(0, 32));
    const iv = CryptoJS.enc.Utf8.parse("");
    let cipher = CryptoJS.AES.decrypt(setupKey, key, {
        iv: iv,
    });
    var setupKeyDecrypt = cipher.toString(CryptoJS.enc.Utf8);
    return setupKeyDecrypt;
}

function CryptoJSAES(Encrypt, key) {
    var key = CryptoJS.enc.Utf8.parse(key.substr(0, 32));
    const iv = CryptoJS.enc.Utf8.parse("");
    let cipher = CryptoJS.AES.encrypt(Encrypt, key, {
        iv: iv,
    });
    var textString = cipher.toString();
    console.log(Encrypt);
    console.log(textString);
    return textString;
}

function generateCheckSum(type, microtime, setupKeyDecrypt, phone) {
    var time = microtime / 1000000000000.0;
    const Encrypt = `${phone}${microtime}000000${type}${time}E12`;
    return CryptoJSAES(Encrypt, setupKeyDecrypt);
}

function get_pHash(imei, password, setupKeyDecrypt) {
    var data = `${imei}|${password}`;
    return CryptoJSAES(data, setupKeyDecrypt);
}

async function LoginUser(phoneMOMO, passwordMOMO) {
    const item = await LoadData(phoneMOMO);
    const {
        id,
        phone,
        password,
        Name,
        imei,
        AAID,
        TOKEN,
        ohash,
        SECUREID,
        rkey,
        rowCardId,
        authorization,
        agent_id,
        sessionkey,
        RSA_PUBLIC_KEY,
        REFRESH_TOKEN,
        BALANCE,
        device,
        hardware,
        facture,
        MODELID,
        setupKeyDecrypt,
    } = item;

    const micro_time = microtime.now();

    const header = {
        agent_id: agent_id,
        user_phone: phone,
        sessionkey: " ",
        authorization: "Bearer" + authorization,
        msgtype: "USER_LOGIN_MSG",
        Host: "owa.momo.vn",
        user_id: phone,
        "User-Agent": "okhttp/3.14.17",
        appVer: app.appVer,
        appCode: app.appCode,
        device_os: "ANDROID",
    };
    const data = {
        user: phone,
        msgType: "USER_LOGIN_MSG",
        pass: passwordMOMO,
        cmdId: micro_time + "000000",
        lang: "vi",
        time: micro_time,
        channel: "APP",
        appVer: app.appVer,
        appCode: app.appCode,
        deviceOS: "ANDROID",
        buildNumber: 0,
        appId: "vn.momo.platform",
        result: true,
        errorCode: 0,
        errorDesc: "",
        momoMsg: {
            _class: "mservice.backend.entity.msg.LoginMsg",
            isSetup: false,
        },
        extra: {
            pHash: get_pHash(imei, passwordMOMO, setupKeyDecrypt),
            AAID: AAID,
            IDFA: "",
            TOKEN: TOKEN,
            SIMULATOR: "",
            SECUREID: SECUREID,
            MODELID: MODELID,
            checkSum: generateCheckSum(
                "USER_LOGIN_MSG",
                microtime,
                setupKeyDecrypt,
                phone
            ),
        },
    };

    const USER_LOGIN_MSG = await axios({
        method: "post",
        url: "https://owa.momo.vn/public/login",
        data: data,
        headers: header,
    });
    const extra = USER_LOGIN_MSG.data.extra;
    console.log(USER_LOGIN_MSG.data);
    await db.sequelize.query(`UPDATE cron_momo set password = '${passwordMOMO}',
    authorization = '${extra.AUTH_TOKEN}',
    agent_id = '${USER_LOGIN_MSG.data.momoMsg.agentId}',
    RSA_PUBLIC_KEY = '${extra.REQUEST_ENCRYPT_KEY}',
    REFRESH_TOKEN ='${extra.REFRESH_TOKEN}',
    BALANCE ='${extra.BALANCE}',
    Name ='${extra.FULL_NAME}',
    sessionkey = '${extra.SESSION_KEY}' where phone = '${phone}'
    `);
    return USER_LOGIN_MSG.data;
}

async function QUERY_TRAN_HIS_MSG_NEW(phoneMOMO, begin, end) {
    // var startDate = moment().tz('Asia/Bangkok').startOf('day').format("X")
    // var dateEnd = moment().tz('Asia/Bangkok').format("X")
    // console.log(startDate, dateEnd)
    var item = await LoadData(phoneMOMO);
    var {
        id,
        phone,
        password,
        Name,
        imei,
        AAID,
        TOKEN,
        ohash,
        SECUREID,
        rkey,
        rowCardId,
        authorization,
        agent_id,
        setupKeyDecrypt,
        setupKey,
        sessionkey,
        RSA_PUBLIC_KEY,
        REFRESH_TOKEN,
        BALANCE,
        device,
        hardware,
        facture,
        MODELID,
    } = item;
    const header = {
        authorization: "Bearer " + authorization,
        user_phone: phone,
        Host: "m.mservice.io",
    };
    const Data = {
        userId: phone,
        fromTime: begin * 1000,
        toTime: end * 1000,
        limit: 200,
    };
    try {
        const QUERY_TRAN_HIS_MSG_NEW = await axios({
            method: "POST",
            url: "https://m.mservice.io/hydra/v1/user/noti",
            data: Data,
            headers: header,
        });
        if (QUERY_TRAN_HIS_MSG_NEW.data.success) {
            // console.log(QUERY_TRAN_HIS_MSG_NEW.data.message.notifications);
            const data = QUERY_TRAN_HIS_MSG_NEW.data.message.notifications;
            var rerults = [];

            for (let i of data) {
                var extra = JSON.parse(i.extra);

                if (i.type === 77 || i.type === 90) {
                    rerults.push({
                        tranId: i.tranId,
                        partnerID: i.sender,
                        caption: i.caption,
                        time: moment(i.time)
                            .tz("Asia/Bangkok")
                            .format("DD/MM/YYYY HH:mm:ss "),
                        partnerName: extra.partnerName,
                        comment: extra.comment,
                        amount: extra.amount,
                        type: i.type,
                        debitAmount: 0,
                        checktime: i.time,
                    });
                }
                if (i.type === 16) {
                    rerults.push({
                        tranId: i.tranId,
                        partnerID: i.sender,
                        caption: i.caption,
                        time: moment(i.time)
                            .tz("Asia/Bangkok")
                            .format("DD/MM/YYYY HH:mm:ss "),
                        debitAmount: Number(i.body.replace(/\D/g, "")),
                        partnerName: "",
                        comment: i.body,
                        type: i.type,
                        amount: 0,
                        checktime: i.time,
                    });
                }
            }
            return rerults;
        }
    } catch (error) {
        // await GENERATE_TOKEN_AUTH_MSG(phone);
        // await QUERY_TRAN_HIS_MSG_NEW(phoneMOMO, begin, end);

        // console.log(error);
    }
}

async function detailTransaction(phoneMOMO, ID) {
    const micro_time = microtime.now();
    const item = await LoadData(phoneMOMO);
    const {
        id,
        phone,
        password,
        Name,
        imei,
        AAID,
        TOKEN,
        ohash,
        SECUREID,
        rkey,
        rowCardId,
        authorization,
        agent_id,
        setupKeyDecrypt,
        setupKey,
        sessionkey,
        RSA_PUBLIC_KEY,
        REFRESH_TOKEN,
        BALANCE,
        device,
        hardware,
        facture,
        MODELID,
    } = item;

    const header = {
        authorization: `Bearer ${authorization}`,
        user_phone: phone,
        Host: "owa.momo.vn",
        msgType: "DETAIL_TRANS",
        agent_id: agent_id,
        sessionkey: sessionkey,
    };
    const Data = {
        requestId: micro_time,
        transId: ID,
        serviceId: "transfer_p2p",
        offset: 0,
        limit: 4,
        appVer: app.appVer,
        appCode: app.appCode,
        lang: "vi",
        deviceOS: "ANDROID",
        channel: "APP",
        buildNumber: 0,
        appId: "vn.momo.transactionhistory",
    };
    try {
        const transhis = await axios.post(
            "https://api.momo.vn/sync/transhis/details",
            Data,
            {
                headers: header,
            }
        );
        const noidung = JSON.parse(transhis.data.momoMsg.serviceData);
        return noidung;
    } catch (error) {
        console.log(error);
    }
}

async function QUERY_TRAN_HIS_MSG(phoneMOMO, begin, end) {
    // var startDate = moment().tz('Asia/Bangkok').startOf('day').format("X")
    // var dateEnd = moment().tz('Asia/Bangkok').format("X")
    // console.log(startDate, dateEnd)
    const micro_time = microtime.now();
    const item = await LoadData(phoneMOMO);
    const {
        id,
        phone,
        password,
        Name,
        imei,
        AAID,
        TOKEN,
        ohash,
        SECUREID,
        rkey,
        rowCardId,
        authorization,
        agent_id,
        setupKeyDecrypt,
        setupKey,
        sessionkey,
        RSA_PUBLIC_KEY,
        REFRESH_TOKEN,
        BALANCE,
        device,
        hardware,
        facture,
        MODELID,
    } = item;
    const header = {
        authorization: `Bearer ${authorization}`,
        user_phone: `${phone}`,
        Host: "owa.momo.vn",
        agent_id: `${agent_id}`,
        sessionkey: `${sessionkey}`,
    };
    const Data = {
        requestId: `${micro_time}`,
        startDate: `${begin}`,
        endDate: `${end}`,
        offset: 0,
        limit: 10,
        appVer: app.appVer,
        appCode: app.appCode,
        lang: "vi",
        deviceOS: "ANDROID",
        channel: "APP",
        buildNumber: 0,
        appId: "vn.momo.platform",
    };
    try {
        const QUERY_TRAN_HIS_MSG_NEW = await axios.post(
            "https://api.momo.vn/sync/transhis/browse",
            Data,
            { headers: header }
        );
        const data = QUERY_TRAN_HIS_MSG_NEW.data.momoMsg;
        return data;
    } catch (error) {
        await LoginUser(phone, password)
        // await GENERATE_TOKEN_AUTH_MSG(phone);
        // await QUERY_TRAN_HIS_MSG(phoneMOMO, begin, end);
    }
}

async function GENERATE_TOKEN_AUTH_MSG(phoneMOMO) {
    var microtime = moment().tz("Asia/Bangkok").format("x");
    const item = await LoadData(phoneMOMO);
    const {
        id,
        phone,
        password,
        Name,
        imei,
        AAID,
        TOKEN,
        ohash,
        SECUREID,
        rkey,
        rowCardId,
        authorization,
        agent_id,
        setupKeyDecrypt,
        setupKey,
        sessionkey,
        RSA_PUBLIC_KEY,
        REFRESH_TOKEN,
        BALANCE,
        device,
        hardware,
        facture,
        MODELID,
    } = item;
    const header = {
        accept: "application/json",
        appVer: app.appVer,
        appCode: app.appCode,
        device_os: "ANDROID",
        agent_id: agent_id,
        sessionkey: sessionkey,
        user_phone: phone,
        lang: "vi",
        authorization: "Bearer " + authorization,
        msgtype: "GENERATE_TOKEN_AUTH_MSG",
        "Content-Type": "application/json",
        Host: "api.momo.vn",
        "User-Agent": "okhttp/4.9.0",
    };
    const Data = {
        user: phone,
        msgType: "GENERATE_TOKEN_AUTH_MSG",
        cmdId: `${microtime}000000`,
        lang: "vi",
        time: microtime,
        channel: "APP",
        appVer: app.appVer,
        appCode: app.appCode,
        deviceOS: "ANDROID",
        buildNumber: 0,
        appId: "vn.momo.platform",
        result: true,
        errorCode: 0,
        errorDesc: "",
        momoMsg: {
            _class: "mservice.backend.entity.msg.RefreshTokenMsg",
            refreshToken: REFRESH_TOKEN,
        },
        extra: {
            pHash: get_pHash(imei, password, setupKeyDecrypt),
            AAID: AAID,
            IDFA: "",
            TOKEN: TOKEN,
            SIMULATOR: "",
            SECUREID: SECUREID,
            MODELID: MODELID,
            checkSum: generateCheckSum(
                "USER_LOGIN_MSG",
                microtime,
                setupKeyDecrypt,
                phone
            ),
        },
    };

    const GENERATE_TOKEN_AUTH_MSG = await axios({
        method: "POST",
        url: "https://api.momo.vn/backend/auth-app/public/GENERATE_TOKEN_AUTH_MSG",
        data: Data,
        headers: header,
    });
    console.log(GENERATE_TOKEN_AUTH_MSG.data)
    if (GENERATE_TOKEN_AUTH_MSG.data.resultType === "SUCCESS") {
        const extra = GENERATE_TOKEN_AUTH_MSG.data.extra;
        await db.sequelize.query(`UPDATE cron_momo SET 
        authorization = '${extra.AUTH_TOKEN}',
        agent_id = ${agent_id},
        RSA_PUBLIC_KEY = '${extra.REQUEST_ENCRYPT_KEY}',
        sessionkey = '${extra.SESSION_KEY}' WHERE phone = '${phone}' `);
    }
}

module.exports = {


    detailTransaction, QUERY_TRAN_HIS_MSG
};