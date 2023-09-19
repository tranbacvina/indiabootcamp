const { gotScraping } = require('got-scraping');
const axios = require('axios');
const cheerio = require("cheerio");

(async () => {
    const response = await gotScraping({
        url: 'https://gitiho.com/khoa-hoc/ebook-tuyet-dinh-excel-khai-pha-10-ky-thuat-ung-dung-excel-ma-dai-hoc-khong-day-ban',

    });
    // const response = await axios.get('https://www.udemy.com/course/khoa-hoc-python-ui-can-ban-trong-maya/')
    // console.log(response.body)


    let $ = cheerio.load(response.body);
    // const requirements = $("h2.requirements--title--2wsPe").next().children().map((i, e) => { return $(e).text() }).get()
    // const whatyouwilllearn = $(".what-you-will-learn--objectives-list-two-column-layout--rZLJy").children().map((i, e) => { return $(e).text() }).get()
    // console.log(requirements)

    // console.log(whatyouwilllearn)
    const name = $("h1").text();

    const description = $("meta[name='description']").attr("content")
    const image = $("meta[property='og:image']").attr("content")

    const price = 50000
    const whatyouwilllearn = $('.pixcel-content').map((i, e) => { return $(e).text().trimStart().replace(/[\t\n]/gm, '') }).get()
    const description_log = $('.cou-description').html()

    console.log(description_log)
})()