const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// CREATE REVIEW
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview._id);
  await listing.save();

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // remove review reference from listing
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  // delete review document
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
