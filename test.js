const { gotScraping } = require('got-scraping');
const axios = require('axios');
const cheerio = require("cheerio");

(async () => {
    const response = await gotScraping({
        url: 'https://www.udemy.com/course/ansys-fluent-training-course-beginner-intermediate/',

    });
    // const response = await axios.get('https://www.udemy.com/course/khoa-hoc-python-ui-can-ban-trong-maya/')
    // console.log(response.body)


    let $ = cheerio.load(response.body);
    const requirements = $("h2.requirements--title--2wsPe").next().children().map((i, e) => { return $(e).text() }).get()
    const whatyouwilllearn = $(".what-you-will-learn--objectives-list-two-column-layout--rZLJy").children().map((i, e) => { return $(e).text() }).get()
    console.log(requirements)

    console.log(whatyouwilllearn)
})()