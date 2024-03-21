const cawn_data = require("./service/cawn_data_test")
const db = require('./models')
const main= async () => {
  const course = await db.course.findOne({
    where:{
      url: 'https://unica.vn/trang-diem-ca-nhan-pro-tai-nha'
    }
  })
  await cawn_data.unica(course)
}

main()