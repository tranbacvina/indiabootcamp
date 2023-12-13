var jwt = require('jsonwebtoken');
const db = require("../models");

require("dotenv").config();

const needLogin = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.jwt, (err, decodeToken) => {
            if (err) {
                res.redirect('/login')
            } else {
                next()
            }
        })
    } else {
        res.redirect('/login')
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.jwt, async (err, decodeToken) => {
            if (err) {
                res.locals.user = null
                next()
            } else {
                // const user = await db.user.findOne({
                //     where: {
                //         username: decodeToken.user
                //     }
                // })
                // if (user) {
                //     res.locals.user = user
                //     next()
                // }
                // else {
                //     res.cookie('jwt', '', { maxAge: 1 })
                //     res.redirect('/admin/login')
                // }
                res.locals.user = decodeToken.user
                console.log(decodeToken)
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}

const checkiSMasterAdmin = (req, res, next) => {
    const token = req.cookies.jwt
    if (!token) {
        res.redirect('/admin/blogs')
        return
    }
   
    jwt.verify(token, process.env.jwt, async (err, decodeToken) => {
        if (err) {
            res.redirect('/admin/blogs')
            return

        } 
      
        const {user} = decodeToken
        if (user == 'alobabyday') {
            next()
        }
        else {
            res.redirect('/admin/blogs')
        return

        }
    })
    
}

module.exports = { needLogin, checkUser,checkiSMasterAdmin }