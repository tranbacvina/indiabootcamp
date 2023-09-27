// const { gotScraping } = require('got-scraping');
// const axios = require('axios');
// const cheerio = require("cheerio");

// (async () => {
//     const response = await gotScraping({
//         url: 'https://gitiho.com/khoa-hoc/ebook-tuyet-dinh-excel-khai-pha-10-ky-thuat-ung-dung-excel-ma-dai-hoc-khong-day-ban',

//     });
//     // const response = await axios.get('https://www.udemy.com/course/khoa-hoc-python-ui-can-ban-trong-maya/')
//     // console.log(response.body)


//     let $ = cheerio.load(response.body);
//     // const requirements = $("h2.requirements--title--2wsPe").next().children().map((i, e) => { return $(e).text() }).get()
//     // const whatyouwilllearn = $(".what-you-will-learn--objectives-list-two-column-layout--rZLJy").children().map((i, e) => { return $(e).text() }).get()
//     // console.log(requirements)

//     // console.log(whatyouwilllearn)
//     const name = $("h1").text();

//     const description = $("meta[name='description']").attr("content")
//     const image = $("meta[property='og:image']").attr("content")

//     const price = 50000
//     const whatyouwilllearn = $('.pixcel-content').map((i, e) => { return $(e).text().trimStart().replace(/[\t\n]/gm, '') }).get()
//     const description_log = $('.cou-description').html()

//     console.log(description_log)
// })()

const axios = require('axios')
const crypto = require('crypto');
function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

const access_token = 'EAASsyRHsm0sBOZCFGGCRZBsMUrZCRA9nSge7eNjyGEZAWPEvZCUztWWA4uWWfERy4lf7Bg57GyhZB3pOGEYHhR6pm5cpEYkr33fZClb5yEH87FC6E8LNG7mCM8N2KSUBy8S6pDo1ZAkXVbSJXJ52EhTxZBTlBRhMpglsUDhZCK984IHF6oUkRflfIKeq1xLqxzxkQGXgZDZD';
const pixel_id = '704457201605603';

const newEvenSendToFacebook = async (email, price, ipClien, client_user_agent) => {
    try {
        let current_timestamp = Math.floor(new Date() / 1000);
        const response = await axios.post(
            `https://graph.facebook.com/v13.0/${pixel_id}/events?access_token=${access_token}`,
            {
                data: [
                    {
                        "event_name": "Purchase",
                        "event_time": current_timestamp,
                        "action_source": "website",
                        "user_data": {
                            "em": sha256(email),
                            "client_ip_address": ipClien,
                            "client_user_agent": client_user_agent,
                        },

                        "custom_data": {
                            "currency": "VND",
                            "value": price
                        }
                    }
                ],
            }
        );
        console.log(response.data)
    } catch (error) {
        console.log(error.response.data)
    }


}


newEvenSendToFacebook('trabacvina@gmail.com', 50000, '192.168.0.3', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36")