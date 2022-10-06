const Users = require('../models/Users');

module.exports = check_Admin_account = async(req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/users/login')
    } else {
        await Users.findOne({ username: req.session.username }).then(user => {
            if (user.level == 'admin') {
                next();
            } else {
                user.isLogin = false;
                user.save();
                req.session.destroy();
                return res.redirect('/users/login');
            }
        });
    }
}