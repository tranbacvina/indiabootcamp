const db = require("../models")
const courseService = require("../service/course")
const schema = require("../service/schema")
const ultrilSevice = require('../service/ulltil')
const { Op, Sequelize } = require("sequelize");

module.exports = {
    allService: async (req,res) => {
        const Services = await db.course.findAll({
            include: {
                model: db.Category, where: {
                    slug: 'service'
                }
            },
        })
        res.send(Services)
    },

    oneService:  async (req, res) => {
        const { slug } = req.params;
        const course = await courseService.oneCourseSlug(slug);
        if (!course) {
            res.status(404).render("layout/404")
            return
        }
        
        let query = {
            limit: 16,
            order: [['updatedAt','DESC']]
        }
    
        if (course.Topics.length  > 0) {
            const parentTopicId = course.Topics.map(item => item.id)
                query.include = {
                    model: db.Topic,
                    where: {
                        id: {
                            [Op.in]: parentTopicId
                        }
                    }
                }
        }
        const CourseLienquanBreadcrumb = await Promise.all([
            db.course.findAll(query),ultrilSevice.getTopicWithParents(course.TopicId)
        ])
        const courses = CourseLienquanBreadcrumb[0]
        const breadcrumb = CourseLienquanBreadcrumb[1] 
    
        const breadcrumbSchemaCourseOne = schema.breadcumbCourse(breadcrumb, course)
    
        const ratings = ultrilSevice.calculateStats(course.ratings)
    
    
        res.render("service/one-service", { course, breadcrumb, ratings, courses, breadcrumbSchemaCourseOne,  });
    
    }
}