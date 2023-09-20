const topic = require("../service/topic")
const courseService = require("../service/course")
const paginate = require('express-paginate');

const db = require("../models")

const allTopicShow = async (req, res) => {
    const topics = await topic.findAll()
    res.render('admin/topics/topics', { topics })
}

const createTopicView = async (req, res) => {
    res.render('admin/topics/create')
}

const updateTopic = async (req, res) => {
    const topicID = req.params.id
    const { topicName, topicSlug } = req.body
    try {
        await db.Topic.update({
            name: topicName,
            slug: topicSlug
        }, {
            where: {
                id: topicID
            }
        })
        res.send({
            success: true,
            data: 'Cập nhật thành công'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const createTopic = async (req, res) => {
    try {
        const { name, slug } = req.body
        console.log(name, slug, req.body)

        const newTopic = await db.Topic.create({
            name, slug
        })
        console.log(newTopic)
        res.redirect(`/admin/topic/`)
    } catch (error) {
        res.status(500).send({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const deleteTopic = async (req, res) => {
    const id = req.params.id
    try {

        await db.Topic.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Topic removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const topicSlugGetCourses = async (req, res) => {
    const { text, limit, } = req.query
    const { slug } = req.params
    const course = await courseService.findManyCourseTopic(text, limit, req.skip, slug)
    // res.send(course)
    // const itemCount = course.count;
    // const pageCount = Math.ceil(course.count / req.query.limit);


    if (course.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = course.count;
        const pageCount = Math.ceil(course.count / req.query.limit);
        res.render('course/course', {
            course: course.rows,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }

}
module.exports = { createTopic, allTopicShow, deleteTopic, updateTopic, createTopicView, topicSlugGetCourses }