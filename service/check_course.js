const db = require("../models");
const check_web = require("./cawn_data");
var { validationResult } = require('express-validator');

const checkCourse = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).json({
            success: false,
            data: errors.array()[0].msg
        })
    }
    const { link } = req.body;
    const regex = /(udemy.com\/course|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
    const expression = link.match(regex);
    if (link.match(regex)) {
        switch (expression[0]) {
            case "unica.vn":
                var data = await check_web.unica(link);
                if (!data) {
                    return res.status(200).json({
                        success: false,
                        data: 'Không hỗ trợ URL này'
                    });
                }
                return res.status(200).json({ success: true, data });

            case "udemy.com/course":
                var data = await check_web.udemy(link);
                if (!data | data.dbitem.is_practice_test_course) {
                    return res.status(200).json({
                        success: false,
                        data: 'Không hỗ trợ URL này',
                    });
                }
                return res.status(200).json({ success: true, data });
            case "gitiho.com/khoa-hoc":
                var data = await check_web.gitiho(link);
                if (!data) {
                    return res.status(200).json({
                        success: false,
                        data: 'Không hỗ trợ URL này',
                    });
                }
                return res.status(200).json({ success: true, data });
            default:
                return res.status(200).json({
                    success: false,
                    data: 'Không hỗ trợ URL này'
                });
        }
    } else {
        return res.status(200).json({
            success: false,
            data: 'Không hỗ trợ URL này'
        });
    }
};

const checkCoursev2 = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).json({
            success: false,
            messenger: errors.array()[0].msg,
            data: ''
        }
        )
    }
    const { links } = req.body;
    const promises = []
    for (let link of links) {
        const regex = /(udemy.com\/course|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
        const expression = link.match(regex);
        switch (expression[0]) {
            case "unica.vn":
                promises.push(check_web.unica(link))
                break;
            case "udemy.com/course":
                promises.push(check_web.udemy(link))
                break;
            case "gitiho.com/khoa-hoc":
                promises.push(check_web.gitiho(link))
                break;
            default:
                promises.push({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })

        }
    }
    const result = await Promise.all(promises)
    return res.status(200).json(result)
};
module.exports = { checkCourse, checkCoursev2 }