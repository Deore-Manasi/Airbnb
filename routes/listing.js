const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validatelisting } = require("../middleware.js");
const multer = require("multer"); //for uploaded file parsing
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

//index route//create route
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,
  // validatelisting,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);

//new route
router.get("/new", isLoggedIn, listingController.newForm);

//show route//update route
router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//edit route//delete route
router
  .route("/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;
