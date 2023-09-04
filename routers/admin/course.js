const Routers = require("express").Router();
const course = require("../../controllers/course")

Routers.get('/', course.all)

Routers.get('/chuagui', course.courseChuaGui)
Routers.get('/cawncoursechuagui', course.cawnCourseChuaGui)
Routers.get('/khoahoccantai', course.coursedownload)
Routers.post('/sendEmailCourse', course.sendEmailCourse)


Routers.get('/:id', course.one)




module.exports = Routers