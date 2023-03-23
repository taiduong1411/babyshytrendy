const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
var upload_file = multer({ storage: storage });
module.exports = upload_file;