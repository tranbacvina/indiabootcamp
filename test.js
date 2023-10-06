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

const getAllTopics = async (id) => {
    const req = await axios.get(`https://www.udemy.com/api-2.0/discovery-units/?context=topic&from=0&page_size=16&item_count=12&label_id=${id}&source_page=topic_page&locale=vi_VN&currency=vnd&navigation_locale=vi_VN&skip_price=true`)

    const itemsTopics = req.data.units[4].items.map(item => { return { name: item.display_name, id: item.id } })
    console.log(itemsTopics)
    for (let item of itemsTopics) {
        console.log(item.name)
        try {
            const req = await axios.get(`https://www.udemy.com/api-2.0/discovery-units/?context=topic&from=0&page_size=16&item_count=12&label_id=${item.id}&source_page=topic_page&locale=vi_VN&currency=vnd&navigation_locale=vi_VN&skip_price=true`)

            const itemsTopics = req.data.units.filter(item => item.item_type == 'course_label')[0].items.map(item => { return { name: item.display_name, id: item.id } })

            console.log(itemsTopics)
        } catch (error) {
            console.log(error)
            continue
        }

    }
}

const allCourseInTopic = async (id) => {
    const req = await axios.get(`https://www.udemy.com/api-2.0/discovery-units/all_courses/?page_size=36&subs_coll_id=&subcategory=&instructional_level=&lang=&price=&duration=&closed_captions=&subs_filter_type=&label_id=${id}&source_page=topic_page&locale=vi_VN&currency=vnd&navigation_locale=vi_VN&skip_price=true&sos=pl&fl=lbl`)
    const items = req.data.unit.items.map(item => { return item.url })
    const course_labels = req.data.unit.course_labels.map(item => { return item.display_name })

    console.log(course_labels)
}
getAllTopics(5306)