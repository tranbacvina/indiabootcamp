const { check, body } = require('express-validator');

const checkFormLanding = (req, res, next) => {
    return [
        check('email').not().isEmpty(),
        check('email').isEmail()
    ]
    next()
}
const create = () => [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
]

const update = () => [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
]

const nameCatogory = () => [
    body('name').notEmpty().withMessage('Name is required'),
]
module.exports = { checkFormLanding, create, update, nameCatogory }