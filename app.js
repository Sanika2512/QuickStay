if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

app.use("/uploads", express.static("uploads"));

const User = require("./models/user.js");
const Listing = require("./models/listing.js"); // ✅ ONLY ONCE
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbURL = process.env.MONGO_URL;

/* ---------------- DATABASE ---------------- */
mongoose.connect(dbURL, {
  tls: true,
  tlsAllowInvalidCertificates: true,
})
.then(() => {
  console.log("Connected to DB");
  app.listen(8080, () => {
    console.log("Server running on port 8080");
  });
})
.catch(err => console.log("DB connection error:", err));

/* ---------------- VIEW ENGINE ---------------- */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

/* ---------------- SESSION STORE ---------------- */
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
     secret: process.env.SECRET,

   },
  touchAfter: 24 * 3600,
});

store.on("error", err => {
  console.log("MONGO SESSION ERROR", err);
});

/* ---------------- SESSION ---------------- */
app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}));

app.use(flash());

/* ---------------- PASSPORT ---------------- */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ---------------- LOCALS ---------------- */
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

/* ---------------- HOME ROUTE ---------------- */
app.get("/", async (req, res) => {
  try {
    const featuredListings = await Listing.find({ isFeatured: true })
      .limit(12)
      .sort({ rating: -1, reviewCount: -1 });

    res.render("listings/home", { featuredListings });
  } catch (err) {
    console.error(err);
    res.render("listings/home", { featuredListings: [] });
  }
});

/* ---------------- SEARCH ROUTE ---------------- */
app.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q || "";
    
    // If empty search, redirect to listings page
    if (!searchQuery.trim()) {
      req.flash("info", "Please enter a search term");
      return res.redirect("/listings");
    }
    
    // Create regex for case-insensitive search
    const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    
    // Search in multiple fields with regex
    const listings = await Listing.find({
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ]
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(50); // Limit results
    
    // If you want to add pagination later, uncomment and use this:
    /*
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    
    const total = await Listing.countDocuments({
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ]
    });
    
    const listings = await Listing.find({
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    */
    
    // Render search results page
    res.render("listings/search", {
      listings,
      searchQuery,
      title: `Search Results for "${searchQuery}" - WanderLust`
      // Add these if using pagination:
      // pagination: {
      //   currentPage: page,
      //   totalPages,
      //   hasNextPage,
      //   hasPrevPage,
      //   nextPage: page + 1,
      //   prevPage: page - 1,
      //   totalResults: total
      // }
    });
    
  } catch (error) {
    console.error("Search error:", error);
    req.flash("error", "Error performing search");
    res.redirect("/listings");
  }
});

/* ---------------- ROUTES ---------------- */
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

/* ---------------- 404 ---------------- */
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error.ejs", { err });
});