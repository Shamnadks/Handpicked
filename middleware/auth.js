
const isLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};


const isLogout = (req, res, next) => {
  if (req.session.user) {
    req.session.user = false;
    req.session.userData = false;
    userData = undefined;
    res.redirect("/");

  }
  else {
    next();

  }
};


module.exports = {
  isLogin,
  isLogout
}