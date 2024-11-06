if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); //custom error handling
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

/* this is for method-override package  */
const methodoverride = require("method-override");
app.use(methodoverride("_method"));

app.set("view engine", "ejs"); //for views folder
app.set("views", path.join(__dirname, "views"));

/*This is for make data readable for express which comes from url request. */
app.use(express.urlencoded({ extended: true }));

/*this is for public folder */
app.use(express.static(path.join(__dirname, "public")));

/* this is for ejs- mate */
app.engine("ejs", ejsMate);

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Mongo Connected !!");
  })
  .catch((err) => {
    console.log(err);
  });

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, //sec
});

store.on("error", () => {
  console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store: store,
  secret: "Super-Duper-Secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    //one week claculation in miliseconds
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Welcome to our project");
// });

app.use(session(sessionOptions));
app.use(flash());

/* User model and Password Authentication */

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//app.get("/testlisting", async(req,res)=>{
//    let smpl = new Listing({
//        title : "My house",
//        description: "by the sunset.",
//        price:50000,
//        location:"chadwad",
//        country:"india"
//    });
//
//     await smpl.save()
//    .then(res =>{
//        console.log("saved perfectly");
//    })
//    .catch(err =>{
//        console.log(err);
//    });
//
//    res.send("Hureeeeee!!!!");
//});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//app.get("/demouser", async (req, res) => {
//  let fakeUser = new User({
//    email: "abc@gmail.com",
//    username: "alphagirl",
//  });
//
//  let registereduser = await User.register(fakeUser, "hello");
//  res.send(registereduser);
//});

//routing for  listing
app.use("/listings", listingRouter);

//routing for reviews
app.use("/listings/:id/reviews", reviewRouter);

//routing for users
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "PAGE NOT FOUND !!"));
});

app.use((err, req, res, next) => {
  let { statuscode = 400, message = "SOMETHING WENT WRONG !!" } = err;
  // res.status(statuscode).send(message);
  res.status(statuscode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server started !!");
});
