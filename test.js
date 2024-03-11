const cawn_data = require("./service/ulltil")
const db = require('./models')
const main= async () => {
  const course = await db.course.findOne({
    where:{
      id:6365
    }
  })

  course.is_practice_test_course = true
  await course.save()
}

main()