const Routers = require("express").Router();
const course = require("../../controllers/course")

Routers.get('/', course.all)
Routers.get('/topic/:slug', course.allCourseTopic)
Routers.post('/', course.create)
Routers.post('/update/:id', course.updateCourse)
Routers.post('/:id/drives', course.addDriveToCourse)
Routers.get('/:id/drives/del/:iddrive', course.delDriveToCourse)

Routers.get('/chuagui', course.courseChuaGui)
Routers.get('/cawncoursechuagui', course.cawnCourseChuaGui)
Routers.get('/cawnnamecoursechuagui', course.cawnNameCourseChuaGui)
Routers.get('/khoahoccantai', course.coursedownload)
Routers.post('/sendEmailCourse', course.sendEmailCourse)
Routers.get("/delete/:id",course.deleteCourseColtroler)


Routers.get('/:id', course.one)




module.exports = Routers