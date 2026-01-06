const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingJoiSchema } = require("../views/schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

/* ---------------- JOI VALIDATION ---------------- */
const validateListing = (isUpdate = false) => {
  return (req, res, next) => {
    const { error } = listingJoiSchema.validate(req.body, { abortEarly: false });
    const errors = [];

    if (error) {
      errors.push(...error.details.map(el => el.message));
    }

    // Only require image if not an update
    if (!isUpdate && !req.file) {
      errors.push("Image is required");
    }

    if (errors.length > 0) {
      // Render appropriate form
      const template = isUpdate ? "listings/edit" : "listings/new";
      return res.status(400).render(template, {
        errors,
        listing: req.body.listing
      });
    }

    next();
  };
};




/* ================= ROUTES ================= */

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),
     validateListing(false),
    wrapAsync(listingController.createListing)
  );

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW + UPDATE + DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing(true),
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);
// Search route
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        
        if (!searchQuery.trim()) {
            // If empty search, redirect to listings page
            return res.redirect('/listings');
        }
        
        // MongoDB query with case-insensitive regex
        const searchRegex = new RegExp(searchQuery, 'i');
        
        // Search in title, location, and description
       
       const allListings = await Listing.find({
    $or: [
         { title: { $regex: search, $options: "i" } },
         { location: { $regex: search, $options: "i" } },
         { country: { $regex: search, $options: "i" } }
        ]
        }).populate("image");   // 🔥 image populate mandatory

          res.render("listings/search", { allListings, search });

        
        res.render('listings/search', { 
            listings, 
            searchQuery,
            title: `Search Results for "${searchQuery}" - WanderLust`
        });
        
    } catch (error) {
        console.error('Search error:', error);
        req.flash('error', 'Error performing search');
        res.redirect('/listings');
    }
});


module.exports = router;
