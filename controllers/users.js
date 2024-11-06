const User = require("../models/user.js");

module.exports.renderSignupform = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "WELCOME TO AIRBNB ");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", "Welcome back to Airbnb !");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  if (
    redirectUrl.includes("/reviews/") &&
    redirectUrl.includes("_method=DELETE")
  ) {
    // If it's a DELETE route, change it to "/listings"
    redirectUrl = "/listings";
  }
  //  console.log(redirectUrl);
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You Logged Out !");
    res.redirect("/listings");
  });
};
