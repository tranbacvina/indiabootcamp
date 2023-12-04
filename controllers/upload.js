var multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, (Date.now() + file.originalname).replace(/ /g, '-'));
    },

});

const upload = multer({ storage });

module.exports = upload
