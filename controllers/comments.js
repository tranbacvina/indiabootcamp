const db = require("../models")


const addCommentsToCourse = async (req,res) => {
    const courseId = req.params.courseid
    const {star, email, comments} = req.body

    if (!star & !email & !comments) {
        res.status(400).send('Không được để trống Đánh giá, Email và Bình luận!')
        return
    }

    const checkEmailisButCourse = await db.order.findAll({
        where:{
            email,
            status: "Paid"
        },
        include: {
            model: db.orderItem,
            include: {
                model: db.course,
                where: {
                    id: courseId
                }
            }
        }
    })
    if (checkEmailisButCourse.length === 0) {
        res.status(401).send('Chỉ có email đã mua khoá học mới có thể comments!')
        return
    }
    const course = await db.course.findOne({
        where: { id: courseId}
    })
    // await course.createRating({star, email, comments})
    res.status(201).send( 'Đăng đánh giá thành công')
}

module.exports = { addCommentsToCourse}