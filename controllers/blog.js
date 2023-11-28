const serviceBlog = require("../service/blog")
const catgoriesServices = require("../service/catgories")
const paginate = require('express-paginate');
const serviceCategories = require("../service/catgories")
const db = require("../models");

const allBlogAdmin = async (req, res) => {
    const { text, limit, } = req.query
    const blogs = await serviceBlog.findMany(text, limit, req.skip)
    if (blogs.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = blogs.count;
        const pageCount = Math.ceil(blogs.count / req.query.limit);
        res.render('admin/blog', {
            blogs: blogs.rows,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const viewUpdate = async (req, res) => {
    const id = req.params.id
    try {
        const blog = await serviceBlog.findOne(id)
        const categories = await serviceCategories.findAll()
        if (!blog) {
            return res.render('layout/404')
        }
        return res.render('admin/blog/edit', {
            blog,
            categories,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const postUpdate = async (req, res) => {
    const id = req.params.id
    let {
        title,
        description,
        slug,
        keywords,
        content,
        categoryId,
        statusId
    } = req.body

    try {
        let data = {}

        if (req.file) {
            const filename = req.file.filename;
            data = {
                title,
                content,
                description: description,
                slug,
                keywords,
                thumbnail: filename,
                categoryId,
                isDeleted: statusId


            }

            await db.Media.create({
                title: filename,
                fileUrl: `/${filename}`,
            })
        }
        else {
            data = {
                title,
                content,
                description: description,
                slug,
                keywords,
                categoryId,
                isDeleted: statusId

            }
        }

        await db.Blog.update(data, { where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Blog updated'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }

}

const viewCreate = async (req, res) => {
    try {
        const categories = await serviceCategories.findAll()

        return res.render('admin/blog/create', {
            categories
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const create = async (req, res) => {


    const { title, content, keywords, description, slug, categoryId } = req.body
    try {
        if (req.file) {
            const filename = req.file.filename;
            const url = `${filename}`;
            await db.Media.create({
                title: filename,
                fileUrl: `/${filename}`,
            })
        }
        console.log(req.file)

        const newblog = await db.Blog.create({
            title,
            description: description,
            content,
            keywords,
            thumbnail: req.file.filename,
            categoryId
        },
            {
                include: {
                    model: db.Category,

                }
            })
        return res.redirect(`/admin/blogs/${newblog.id}`)

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}
const remove = async (req, res) => {
    const id = req.params.id

    try {

        await db.Blog.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Blog removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const oneBlogPublic = async (req, res) => {
    const slug = req.params.slug
    const blog = await db.Blog.findOne({
        where: {
            slug
        },
        include: {
            model: db.Category
        }
    })
    if (blog) {
        res.render('blog/one-blog', { blog: blog })
    }
    else {
        res.render('layout/404')
    }
}

const allBlogPublic = async (req, res) => {
    const { text, limit, } = req.query
    const blogs = await serviceBlog.findMany(text, limit, req.skip)
    if (blogs.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = blogs.count;
        const pageCount = Math.ceil(blogs.count / req.query.limit);
        res.render('blog/all', {
            blogs: blogs.rows,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const lienhe = async (req,res) => {
    res.render('blog/lienhe')
}
module.exports = { lienhe,oneBlogPublic, allBlogAdmin, viewUpdate, postUpdate, viewCreate, create, remove,allBlogPublic }