const catgoriesServices = require("../service/catgories")
const db = require("../models")

const allcategoriesShow = async (req, res) => {
    const catgories = await catgoriesServices.findAll()
    res.render('admin/categories/categories', { catgories })
}

const createCategoriesView = async (req, res) => {
    res.render('admin/categories/create')
}

const updateTopic = async (req, res) => {
    const topicID = req.params.id
    const { topicName, topicSlug } = req.body
    try {
        await db.Category.update({
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

        const newTopic = await db.Category.create({
            name, slug
        })
        console.log(newTopic)
        res.redirect(`/admin/categories/`)
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

        await db.Category.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Category removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}
module.exports = { createTopic, allcategoriesShow, deleteTopic, updateTopic, createCategoriesView }