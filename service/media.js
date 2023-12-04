const db = require("../models")

const createMedia = async (name,location) => {
    return await db.Media.create({
        title: name,
        fileUrl:location,
    })
}

module.exports = {createMedia}