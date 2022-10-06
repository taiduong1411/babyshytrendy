const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');


// SET STORAGE
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let pid = req.body.pid;
        let dir = `./src/public/uploads/${pid}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'))
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});

var upload = multer({ storage: storage, limits: { fieldSize: 2 * 1024 * 1024 } });
module.exports = upload;