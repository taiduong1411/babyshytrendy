const Users = require('../models/Users');

module.exports = check_User_account = async(req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/users/login')
    } else if (req.session.level == 'customer' || req.session.level == 'admin') {
        next();
    } else {
        await req.session.destroy();
        return res.redirect('/users/login')
    }
}