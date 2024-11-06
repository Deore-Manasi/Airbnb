const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const Data = await Listing.find({});
  res.render("listings/index.ejs", { Data });
};

module.exports.newForm = (req, res) => {
  console.log(req.user);

  res.render("listings/new.ejs");
};

module.exports.show = async (req, res) => {
  let { id } = req.params;
  // console.log(id);
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested doesn't Exist !!");
    res.redirect("/listings");
  }
  //console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let {title: ntitle,description :ndescription,price:nprice,location:nlocation,country:ncountry,image:nimage} = req.body;
  //console.log(ntitle);
  //if(!req.body.listing){
  //    throw new ExpressError(400,"SEND VALID LISTING DATA");
  //}
  let url = req.file.path;
  let filename = req.file.filename;
  //console.log(url, "..", filename);
  let listing = req.body.listing;
  const newlisting = new Listing(listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  await newlisting.save();
  req.flash("success", "New Listing Added Successfully !! ");
  //console.log(listing);
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested doesn't Exist !!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  let newImageurl = originalImageUrl.replace("/upload", "/upload/w_150");
  res.render("listings/edit.ejs", { listing, newImageurl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated !!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  //console.log(id);
  let deletelisting = await Listing.findByIdAndDelete(id);
  console.log(deletelisting);
  req.flash("success", "Listing Deleted !!");
  res.redirect("/listings");
};
