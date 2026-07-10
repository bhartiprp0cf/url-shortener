const {getUser} = require('../service/auth')

async function restrictToLoggedInUserOnly(req, res, next) {
   const userId = req.cookies.uid;
   
   if(!userUid) return res.redirect("/login");
   const user = getUser(userId)

   if(!user) return res.redirect("/login");

   req.user = user;
   next();
}

module.exports = {
    restrictToLoggedInUserOnly, 
}