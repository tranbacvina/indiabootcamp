const axios = require("axios");
const db = require("../models")
const { gotScraping } = require('got-scraping');
const path = require('path');
const fs = require('fs');
const cheerio = require("cheerio");

const getDriveUdemy = async (links) => {
  const unica = await axios.post(`${process.env.API_CHECK_COURSE}/checkcourseudemy`,
    { links: links }
  )
  return unica.data
}
const givenamereturndrive = async (names) => {
  const unica = await axios.post(`https://sv2.fullbootcamp.com/givenamereturndrive`,
    { names: names }
  )
  return unica.data
}

const base_url = async (link) => {
  try {
    const haveShare = link.includes("/share/")
    if (haveShare) {
      const res = await gotScraping
        .get(link)

      const parse = new URL(res.url);
      var url = parse.origin + parse.pathname;
      return url;
    } else {
      const parse = new URL(link);
      var url = parse.origin + parse.pathname;
      return url;
    }


  } catch (error) {
    console.log(error)
  }

};

const getlastpart = (url) => {
  const parts = url.split('/'); // Tìm vị trí của dấu '/' cuối cùng trong chuỗi
  let lastPart
  if (url.includes('udemy')) {
    lastPart = parts[parts.length - 2];
    return lastPart
  }
  lastPart = parts[parts.length - 1];

  return lastPart
}

const scrapingUdemy = async (link) => {
  const uri = `${link}/?persist_locale=&locale=en_US`
  const response = await gotScraping({
    url: link,

  });

  let $ = cheerio.load(response.body);
  const requirements = $("h2.requirements--title--2wsPe").next().children().map((i, e) => { return $(e).text() }).get()
  const whatyouwilllearn = $(".what-you-will-learn--objectives-list-two-column-layout--rZLJy").children().map((i, e) => { return $(e).text() }).get()
  let scriptContents = JSON.parse($('script[type="application/ld+json"]').html())
  scriptContents = scriptContents[scriptContents.length - 1]
  const topic = scriptContents.itemListElement[scriptContents.itemListElement.length - 1]

  const data = { requirements, whatyouwilllearn, topic: { text: topic.name, href: getlastpart(topic.item) } }
  console.log(data)
  return data
}

const cawnUdemy = async (uri) => {
  const udemydata = await axios.get(
    `https://www.udemy.com/api-2.0/courses/${uri}/?fields[course]=price_detail,price,title,context_info,primary_category,primary_subcategory,avg_rating_recent,visible_instructors,locale,estimated_content_length,num_subscribers,image_480x270&persist_locale=&locale=vi_VN`
    , {
      headers: {
        'Authorization': 'Bearer TeXL+at7QAq597GU6e+rf2HKxrDebHrRkLJQ1iCQB70:i2/jv676IlsR8ZP/bMTG4W80LRSVSqwH7OkiOSrotTQ',
      }
    }
  )


  const sections = await axios.get(`https://www.udemy.com/api-2.0/course-landing-components/${udemydata.data.id}/me/?components=curriculum_context`)
  return { udemydata: udemydata.data, sections: sections.data }
}

const udemy = async (uri) => {
  const urlfixshare_udemy = await base_url(uri.url)
  const patch = urlfixshare_udemy.split('/')[4];
  // const fixURL = new URL(uri.uri).origin + '/course/' + patch
  try {


    const { udemydata, sections } = await cawnUdemy(patch)
    try {
      const { requirements, whatyouwilllearn, topic } = await scrapingUdemy(urlfixshare_udemy)




      const [topics, created] = await db.Topic.findOrCreate(
        {
          where: { slug: topic.href },
          defaults: {
            slug: topic.href,
            name: topic.text
          }
        }
      )
      topics.name = topic.text
      await topics.save()

      console.log('add course to topic', topics.name)
      uri.TopicId = topics.id
      await uri.save()

      const [primary_subcategory, cprimary_subcategory] = await db.Topic.findOrCreate(
        {
          where: { slug: udemydata.primary_subcategory.title_cleaned },
          defaults: {
            name: udemydata.primary_subcategory.title,
            slug: udemydata.primary_subcategory.title_cleaned

          }
        }
      )
      primary_subcategory.name = udemydata.primary_subcategory.title
      await primary_subcategory.save()


      console.log('add topic to primary_subcategory', primary_subcategory.name)
      topics.parent_id = primary_subcategory.id
      await topics.save()

      const [primary_category, cprimary_category] = await db.Topic.findOrCreate(
        {
          where: { slug: udemydata.primary_category.title_cleaned },
          defaults: {
            name: udemydata.primary_category.title,
            slug: udemydata.primary_category.title_cleaned

          }
        }
      )
      primary_category.name = udemydata.primary_category.title
      await primary_category.save()
      console.log('add primary_subcategory to primary_category', primary_category.name)

      primary_subcategory.parent_id = primary_category.id
      await primary_subcategory.save()

      await uri.setTopics([topics.id, primary_category.id, primary_subcategory.id])
    } catch (error) {
      console.log(error)
    }


    try {
      const directory = './public/uploads/courses/udemy'
      const image = await downloadImage(udemydata.image_480x270, directory)
      uri.image = `/uploads/courses/udemy/${image}`
      await uri.save()
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

const cawnUnica = async (link) => {
  try {
    const get_web = await axios.get(link);
    let $ = cheerio.load(get_web.data);

    const name = $('h1').text()
    const description = $('h1').next().text()
    const image = `https://unica.vn/${$("meta[property='og:image']").attr("content")}`;
    const price = 99000
    const description_log = $('.mark').html()


    const targetDiv = $('div:contains("Bạn sẽ học được")').filter((index, element) => {
      return $(element).text().trim() === 'Bạn sẽ học được';
    });
    const whatyouwilllearn = targetDiv.next().find('p').map((index, element) => $(element).text().trim()).get();

    const noidungDiv = $('div:contains("Nội dung khóa học")').filter((index, element) => {
      return $(element).text().trim() === 'Nội dung khóa học';
    }).next().next().children();
    const sections = []
    const panel = noidungDiv.map((i, e) => {
      if (i == 0 || i % 2 == 0) {
        const t = $(e).find('.flex-auto')

        const title = t.text().trim().replace(/\n/g, '')
        const tid = t.parent().attr('data-collapse-toggle')


        const items = $(`#${tid}`).children().map((i, e) => {
          let title = $(e).find('.text-sm').text().trim().replace(/\s\s/g, '')
          const content_summary = $(e).find('.min-w-12').text().trim()
          return { title, content_summary }
        }).get()




        sections.push({ title, items, lecture_count: items.length });
      }

    })
    console.log(sections)
    const originprice = parseInt($('.price-sale:first').text().replace(/[,.đ]/g, ''))


    // let breadcrumb = $(".breadcumb-detail-course").children('a')

    let breadcrumb = $('[aria-label="Breadcrumb"]').find('ol').children()
    let parentTopic
    let topic
    if (breadcrumb.length == 3) {
      parentTopic = {
        name: $(breadcrumb[1]).find('a').text().trim(),
        href: getlastpart($(breadcrumb[1]).find('a').attr('href'))
      }
      topic = {
        name: $(breadcrumb[2]).find('a').text().trim(),
        href: getlastpart($(breadcrumb[2]).find('a').attr('href'))
      }
    }

    if (breadcrumb.length == 2) {
      parentTopic = null
      topic = {
        name: $(breadcrumb[1]).find('a').text().trim(),
        href: getlastpart($(breadcrumb[1]).find('a').attr('href'))
      }
    }

    console.log(parentTopic, topic)

    return {
      name,
      description,
      image,
      price,
      is_practice_test_course: false,
      description_log,
      whatyouwilllearn,
      requirements: [],
      sections: { sections },
      originprice,topic,
      parentTopic, 
    }
  } catch (error) {
    console.log(error)
    return error
  }

}

const unica = async (uri) => {
  const urlfixshare_udemy = await base_url(uri.url)
  try {
    const {
      name,
      description,
      image,
      price,
      is_practice_test_course,
      description_log,
      whatyouwilllearn,
      requirements,
      sections,
      originprice,
      topic, parentTopic
    } = await cawnUnica(urlfixshare_udemy)
    console.log(topic, parentTopic)
    // uri.originprice = originprice
    // uri.sections = {sections: sections}
    let setofTopic = []
    const [ctopic, created] = await db.Topic.findOrCreate(
      {
        where: { slug: topic.href },
        defaults: {
          name: topic.name,
          slug: topic.href

        }
      }
    )
    uri.TopicId = ctopic.id
    await uri.save()

    setofTopic = [...setofTopic, ctopic.id]

    if (parentTopic !== null) {
      const [cparent, createdparent] = await db.Topic.findOrCreate(
        {
          where: { slug: parentTopic.href },
          defaults: {
            name: parentTopic.name,
            slug: parentTopic.href

          }
        }
      )
      ctopic.parent_id = cparent.id
      await ctopic.save()

      setofTopic = [...setofTopic, cparent.id]

    }
    await uri.setTopics(setofTopic)

    try {
      const directory = './public/uploads/courses/unica'
      const images = await downloadImage(image, directory)
      uri.image = `/uploads/courses/unica/${images}`
      await uri.save()
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

const cawnGitio = async (link) => {
  try {
    const get_web = await axios.get(link);
    let $ = cheerio.load(get_web.data);

    const name = $("h1").text();
    const description = $(".line-clamp-2-lines").text()
    const image = $("meta[property='og:image']").attr("content")

    const price = 50000
    const description_log = $('.cou-description').html()
    const whatyouwilllearn = $('.pixcel-content').map((i, e) => { return $(e).text().trim().replace(/[\t\n]/gm, '') }).get()
    const sections = []

    const contentList = $('.content-list').map((i, e) => {
      const title = $(e).find('h3').text()
      const items = $(e).find('li').map((i, e) => {
        const title = $(e).find('.lecture-title').text().split('.')[1].trim().replace(/[\t\n]/gm, '')
        const content_summary = $(e).find('.duration').text().trim().replace(/[\t\n]/gm, '')
        return { title, content_summary };
      }).get()
      sections.push({ title, items, lecture_count: items.length });
    })

    const originprice = parseInt($('.sale-price-display-js:first').text().replace(/[,.đ]/g, ''))
    const breadcrumb = $(".gitiho-breadcrumb").children()
    const topic = {
      text: $(breadcrumb).last().text().trim(),
      href: getlastpart($(breadcrumb).last().find('a').attr('href'))
    }
    let parent
    if (breadcrumb.length == 3) {
      parent = {
        text: $(".gitiho-breadcrumb").children().eq(1).text().trim(),
        href: getlastpart($(".gitiho-breadcrumb").children().eq(1).find('a').attr('href'))
      }
    }

    return {
      name,
      description,
      image,
      price,
      is_practice_test_course: false,
      description_log,
      whatyouwilllearn,
      requirements: [], sections,
      originprice, topic, parent
    }
  } catch (error) {
    console.log(error)
    return error
  }

}

const gitiho = async (uri) => {
  const urlfixshare_udemy = await base_url(uri.url)
  try {

    const {
      name,
      description,
      image,
      price,
      is_practice_test_course,
      description_log,
      whatyouwilllearn,
      requirements,
      sections,
      originprice, topic, parent
    } = await cawnGitio(urlfixshare_udemy)

    const [ctopic, created] = await db.Topic.findOrCreate(
      {
        where: { name: topic.text },
        defaults: {
          name: topic.text,
          slug: topic.href

        }
      }
    )
    uri.TopicId = ctopic.id
    await uri.save()
    await uri.setTopics([ctopic.id])

    // if (parent !== null) {
    //   const [cparent, createdparent] = await db.Topic.findOrCreate(
    //     {
    //       where: { slug: parent.text },
    //       defaults: {
    //         name: parent.text,
    //         slug: parent.href

    //       }
    //     }
    //   )
    //   ctopic.parent_id = cparent.id
    //   await uri.addTopic(cparent.id)
    //   await ctopic.save()
    // }

    try {
      const directory = './public/uploads/courses/gitiho'
      const images = await downloadImage(image, directory)
      uri.image = `/uploads/courses/gitiho/${images}`
      await uri.save()
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

const createNewCourse = async (name, url, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, topicid) => {
  const course = await db.course.create(
    {
      name,
      url,
      description,
      image,
      price,
      is_practice_test_course,
      description_log, whatyouwilllearn, requirements,

    },
    {
      include: {
        model: db.Topic
      }
    }

  );
  await course.addTopic(topicid)
  return course
}
const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');


async function downloadImage(url, directory) {
  let uri = await base_url(url)
  try {
    const response = await axios({
      method: 'GET',
      url: encodeURI(uri),
      responseType: 'stream',
    });

    // Trích xuất tên file từ URL
    const fileName = path.basename(uri);
    const imagePath = path.join(directory, fileName);
    await response.data.pipe(fs.createWriteStream(imagePath));

    return fileName
  } catch (error) {
    throw new Error(`Error downloading the image: ${error}`);
  }
}
module.exports = {
  getDriveUdemy, udemy, givenamereturndrive, unica, gitiho, downloadImage,cawnUnica
};
