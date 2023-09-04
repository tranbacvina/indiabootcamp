const db = require('../models')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const login = async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body
    try {
        const user = await db.user.findOne({
            where: {
                username
            }
        })
        console.log(user)

        const isAuth = bcrypt.compareSync(password, user.password);
        if (isAuth) {
            const token = jwt.sign({ user: user.username }, process.env.jwt, { expiresIn: '7d' })
            // res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
            res.send({ token })
        } else {
            res.status(401).send("Unauthenticated")
        }
    } catch (error) {
        console.log(error)
    }
}

const adduser = async (req, res) => {
    const { username, password } = req.body
    console.log(req.body)

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const user = await db.user.create({
            username, password: hash
        })
        res.status(201).send(user)
    } catch (error) {
        console.log(error)
    }
}


module.exports = { login, adduser }