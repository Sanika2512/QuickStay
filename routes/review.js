const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../views/schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

/* ---------------- REVIEW VALIDATION ---------------- */
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};


/* ---------------- CREATE REVIEW ---------------- */
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

/* ---------------- DELETE REVIEW ---------------- */
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
