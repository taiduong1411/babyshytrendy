const Users = require('../models/Users');

module.exports = check_Admin_account = async(req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/users/login')
    }
    //  else {
    //     let myAcc = await Users.findOne({ username: req.session.username });
    //     if (myAcc.level == 'admin') {
    //         next();
    //     } else {
    //         return res.redirect('/users/login');
    //     }
    // }
    else if (req.session.level == 'admin') {
        next();
    } else {
        await req.session.destroy();
        return res.redirect('/users/login')
    }
}