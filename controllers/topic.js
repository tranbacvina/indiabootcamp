const topic = require("../service/topic")
const courseService = require("../service/course")
const paginate = require('express-paginate');
const ulltilService = require ('../service/ulltil')
const db = require("../models");
const { where } = require("sequelize");
const schema = require('../service/schema')

const allTopicShow = async (req, res) => {
    const fetTopicData = await topic.findAll()
    const rows = JSON.parse(JSON.stringify(fetTopicData, null, 2));
    const topics = await ulltilService.handlerTopic(rows, 0);
    // res.send(topics)
    res.render('admin/topics/topics', { topics })
}

const createTopicView = async (req, res) => {
    res.render('admin/topics/create')
}
const editTopicView = async (req, res) => {
    const {id} = req.params
    const topics = await db.Topic.findAll()

    const topic = await db.Topic.findOne({where:{id}})
    res.render('admin/topics/edit',{topic,topics})
}
const updateTopic = async (req, res) => {
    const topicID = req.params.id
    const { topicName, topicSlug, seotitle, seodescription,parent_id } = req.body
    try {
        await db.Topic.update({
            name: topicName,
            slug: topicSlug, seotitle, seodescription,parent_id
        }, {
            where: {
                id: topicID
            }
        })
        res.redirect(`/admin/topic/${topicID}`)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const createTopic = async (req, res) => {
    try {
        const { name, slug, seotitle, seodescription } = req.body
        console.log(name, slug, req.body)

        const newTopic = await db.Topic.create({
            name, slug, seotitle, seodescription
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
        const topic =await db.Topic.findOne({where: {id}})
        await topic.setCourses([])
        await db.Topic.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Topic removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: error
        })
    }
}

const topicSlugGetCourses = async (req, res) => {
    try {
        const { text, limit, } = req.query
        const { slug } = req.params
        
        

        const results = await Promise.all([topic.findOne(slug),  courseService.findManyCourseTopic(text, limit, req.skip, slug)])

        const topicOne = results[0]

        if (!topicOne) {
            res.redirect('/404')
            return
        }
        
        let course = results[1]
        course = JSON.parse(JSON.stringify(course, null, 2))
        course.rows = course.rows.map(item => {
            return { ...item, ratings: ulltilService.calculateStats(item.ratings)}
        })
        const schemaCourses = schema.createStrucDataCourses(course.rows)
        
        
        const childtopicBreacumn = await Promise.all([topic.findAllTopicChild(topicOne.id),ulltilService.getTopicWithParents(topicOne.id)])
        let childTopics = childtopicBreacumn[0]
        const breadcrumb = childtopicBreacumn[1]

        const schemaBreadcum = schema.breadcumbCourseTopic(breadcrumb)
    
            
        const itemCount = course.count;
        const pageCount = Math.ceil(course.count / req.query.limit);
        res.render('course/course', {
            course: course.rows,
            topicOne,
            childTopics,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            breadcrumb,
            schemaBreadcum,schemaCourses,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });
    } catch (error) {
        res.status(500).render('layout/505')
    }


}
module.exports = { createTopic, allTopicShow, deleteTopic, updateTopic, createTopicView, topicSlugGetCourses,editTopicView }