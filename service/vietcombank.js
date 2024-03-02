const db = require("../models");
var a = require("node-forge");
const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment-timezone");
const https = require('https');
const instance = axios.create({
    // axios options
    httpsAgent: new https.Agent({
        // for self signed you could also add
        // rejectUnauthorized: false,

        // allow legacy server
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    }),
});
const clientPrivateKey =
    "-----BEGIN RSA PRIVATE KEY-----\r\nMIICWwIBAAKBgQCeEk3hNBXhvUKOl62RX2lf9KE1SZ3SCWu5qOWZsCcIBvD6fpDR\r\nP1iuKCmK49lAfP3ntdNRFN8i8MMYnaokZu+Pux3dywIiNVVLVCXFr00UcTR45M6h\r\ndbnLct9cJ+XLJIoJQW2TGz9xINErTMnvlj4n2uIm6nDv2AbR6Ii9+kq+iQIDAQAB\r\nAoGAC3igljtFa0Bk2BxByE74QrJqEIfrIBb27l5Ha0PRUU/PpR4SPF0wflMD0MSA\r\nO6HWez5Cu5ucJdj7D4pBkqq1r8dd7OV+Fmx1NuRhMvbS6ZCMC3SuG9NiW5lA74zF\r\nn6rTLm4pOk1t4mFBkI1SSLn/qnTeY+8XL99qu1awcMYFMAECQQDKXYswd57B5gLL\r\n3K2plIMbvESIdGxFS2Km8VJn1uC+akE7VMiVlb+zPlI0+09mn0WfVt5Kfp5rmP+4\r\nTav2B38JAkEAx/dtVURT8kUePxOEiSwqqVpG1pAB3aLIoQ4TWNzw1X/0vEPT2kS5\r\ncM5kBqUtMmYEpyboTYgDIIAwapdALNmjgQJAeTJA9EwP5qysrA+EanWpd+jvWpHv\r\nbijR8o3A/rOwchoM603Bu+StpNoEPfrs+NcWyXErPI5MrsA5FtZd0MF4kQJAXCcA\r\ncb0NWqbTq4nZGEYMWwNJhfPTiEpOXzpXXCplql5PcLtpVDs7omra2d0hGQq+tjFN\r\n+PznRAEPTu/pGUIrAQJAeUexJMRoPXmxPjSSwNw4C+Exsysek+eiCsxj8fNibN5J\r\n1SwVsv30sUMm+n96Tmv/syE8xlXitb8+LMKvAE7anQ==\r\n-----END RSA PRIVATE KEY-----\r\n";
const captchaApiKey = "612e1424f0a81f347544597305adc28c";
const defaultPublicKey =
    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAikqQrIzZJkUvHisjfu5ZCN+TLy//43CIc5hJE709TIK3HbcC9vuc2+PPEtI6peSUGqOnFoYOwl3i8rRdSaK17G2RZN01MIqRIJ/6ac9H4L11dtfQtR7KHqF7KD0fj6vU4kb5+0cwR3RumBvDeMlBOaYEpKwuEY9EGqy9bcb5EhNGbxxNfbUaogutVwG5C1eKYItzaYd6tao3gq7swNH7p6UdltrCpxSwFEvc7douE2sKrPDp807ZG2dFslKxxmR4WHDHWfH0OpzrB5KKWQNyzXxTBXelqrWZECLRypNq7P+1CyfgTSdQ35fdO7M1MniSBT1V33LdhXo73/9qD5e5VQIDAQAB\n-----END PUBLIC KEY-----";
const clientPublicKey =
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCeEk3hNBXhvUKOl62RX2lf9KE1SZ3SCWu5qOWZsCcIBvD6fpDRP1iuKCmK49lAfP3ntdNRFN8i8MMYnaokZu+Pux3dywIiNVVLVCXFr00UcTR45M6hdbnLct9cJ+XLJIoJQW2TGz9xINErTMnvlj4n2uIm6nDv2AbR6Ii9+kq+iQIDAQAB";
const lang = "vi";
const _timeout = 60;
const DT = "Windows";
const OV = "10";
const PM = "Chrome 104.0.0.0";
const checkAcctPkg = "1";
const username = "0393685809";
const password = "Hennessyxo2#";
const captchaToken = "cd03ca24-308c-7fb5-ef6f-f69e89c83384";
const account_number = "0141000836982";
const browserId = '7d15398838a5ebb212e981effc803cc1'
const headerNull = {
    headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "vi",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Host: "digiapp.vietcombank.com.vn",
        Origin: "https://vcbdigibank.vietcombank.com.vn",
        Referer: "https://vcbdigibank.vietcombank.com.vn/",
        "sec-ch-ua-mobile": "?0",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
        "X-Channel": "Web",
    },
};

const base64_encode = (string) => {
    const encoded = Buffer.from(string, "utf8").toString("base64");
    return encoded;
};

const rsaEncrypt = (string) => {
    const encryptedData = crypto.publicEncrypt(
        {
            key: defaultPublicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(string)
    );

    // The encrypted data is in the form of bytes, so we print it in base64 format
    // so that it's displayed in a more readable form
    console.log("encypted data: ", encryptedData.toString("base64"));
    return encryptedData.toString("base64");
};

const decryptResponse = (e) => {
    const { k: n, d: t } = e,
        i = a.pki.privateKeyFromPem(clientPrivateKey),
        l = a.util.decodeUtf8(i.decrypt(a.util.decode64(n))),
        s = Buffer.from(t, "base64"),
        o = s.slice(0, 16),
        u = s.slice(16),
        c = a.cipher.createDecipher(
            "AES-CTR",
            Buffer.from(l, "base64").toString("binary")
        );
    return (
        c.start({
            iv: o.toString("binary"),
        }),
        c.update(a.util.createBuffer(u)),
        c.finish(),
        a.util.decodeUtf8(c.output.data)
    );
};

const encryptRequest = (e) => {
    try {
        const n = a.random.getBytesSync(32),
            t = a.random.getBytesSync(16);
        e = Object.assign(
            {
                clientPubKey: clientPublicKey,
            },
            e
        );
        const i = a.cipher.createCipher("AES-CTR", n);
        i.start({
            iv: t,
        }),
            i.update(a.util.createBuffer(a.util.encodeUtf8(JSON.stringify(e)))),
            i.finish();
        const l = Buffer.concat([
            Buffer.from(t, "binary"),
            Buffer.from(i.output.data, "binary"),
        ]),
            s = a.pki.publicKeyFromPem(defaultPublicKey).encrypt(a.util.encode64(n));

        return {
            d: l.toString("base64"),
            k: a.util.encode64(s),
        };
    } catch (n) {
        console.log(n);
    }
};

function getBase64(url) {
    return instance
        .get(url, {
            responseType: "arraybuffer",
        })
        .then((response) =>
            Buffer.from(response.data, "binary").toString("base64")
        );
}

const getCaptcha = async () => {
    const url = `https://digiapp.vietcombank.com.vn/utility-service/v1/captcha/${captchaToken}`;

    const image = getBase64(url);
    return image;
};
const solveCaptcha = async () => {
    const Captcha = await getCaptcha();

    // const res = await axios.post(
    //   "https://api.tungduy.com/api/captcha/vietcombank",
    //   {
    //     apikey: captchaApiKey,
    //     base64: Captcha,
    //   }
    // );

    // return res.data.captcha;

    const res = await axios.post("http://ai.mggtd.com/captcha_v4", {
        "image": Captcha, "model": "vcb"
    })
    console.log(res.data)
    return res.data.result
};

const doLogin = async () => {
    const captchaValue = await solveCaptcha();
    const param = {
        DT,
        OV,
        PM,
        captchaToken,
        captchaValue,
        checkAcctPkg,
        lang: "lang",
        mid: 6,
        password,
        user: username,
        browserId
    };
    const data = encryptRequest(param);
    const result = await instance.post(
        "https://digiapp.vietcombank.com.vn/authen-service/v1/login",
        data,
        headerNull
    );
    const result2 = JSON.parse(decryptResponse(result.data));
    console.log(result2);
    // const [token] = await db.sequelize.query(
    //   `SELECT * FROM vietcombank where user = ${username}`
    // );

    await db.sequelize.query(`UPDATE vietcombank SET 
        sessionId = '${result2.sessionId}',
        mobileId = '${result2.userInfo.mobileId}',
        clientId = '${result2.userInfo.clientId}',
        cif = '${result2.userInfo.cif}' WHERE user = '${username}' `);
    // if (token[0]) {

    // } else {
    //   await db.sequelize.query(
    //     `INSERT INTO vietcombank (sessionId,mobileId,clientId,cif,user) VALUES ('${result2.sessionId}','${result2.userInfo.mobileId}','${result2.userInfo.clientId}', '${result2.userInfo.cif}','${username}')`
    //   );
    // }

    return {
        result2,
    };
};

const getHistories = async (fromdate, todate, pageIndex) => {
    try {
        const [token] = await db.sequelize.query(
            `SELECT * FROM vietcombank where user = '${username}'`
        );
        if (token[0]) {
            const param = {
                DT: DT,
                OV: OV,
                PM: PM,
                accountNo: account_number,
                accountType: "D",
                fromDate: fromdate,
                toDate: todate,
                lang: lang,
                pageIndex: pageIndex,
                lengthInPage: 50,
                stmtDate: "",
                stmtType: "",
                mid: 14,
                cif: token[0].cif,
                user: username,
                mobileId: token[0].mobileId,
                clientId: token[0].clientId,
                sessionId: token[0].sessionId,
                browserId
            };
            const result = await instance.post(
                "https://digiapp.vietcombank.com.vn/bank-service/v1/transaction-history",
                encryptRequest(param),
                headerNull
            );
            const result2 = JSON.parse(decryptResponse(result.data));
            // console.log(result2)
            if (result2.code == "108") {
                await doLogin();
                return { status: false, des: result2.des };
            }
            return { status: true, data: result2 };
        } else {
            await doLogin();
        }
    } catch (error) {
        console.log(error);
    }
};

// doLogin()
module.exports = {
    getHistories,
};
