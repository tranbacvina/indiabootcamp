const cawn_data = require("./service/ulltil")
const db = require('./models')
const main= async () => {
  const courses = await db.course.findAll({
    where: {
      url: 'https://unica.vn/khoa-hoc-lam-youtube-bat-dong-san-pro'
    }
  })
  await cawn_data.hand_coursetoTopics(courses)
}

main()