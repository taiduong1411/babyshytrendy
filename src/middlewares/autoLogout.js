const Users = require("../models/Users")
module.exports = autoLogout = async(req, res, next) => {
    if (req.session.username) {
        await Users.findOne({ username: req.session.username }).then(user => {
            user.isLogin = false;
            user.save();
            next();
        })
    } else {
        next()
    }
}