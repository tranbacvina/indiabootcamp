const Routers = require("express").Router();
const course = require("../../controllers/course")

Routers.get('/', course.all)
Routers.post('/', course.create)
Routers.post('/update/:id', course.updateCourse)

Routers.get('/chuagui', course.courseChuaGui)
Routers.get('/cawncoursechuagui', course.cawnCourseChuaGui)
Routers.get('/cawnnamecoursechuagui', course.cawnNameCourseChuaGui)
Routers.get('/khoahoccantai', course.coursedownload)
Routers.post('/sendEmailCourse', course.sendEmailCourse)


Routers.get('/:id', course.one)




module.exports = Routers