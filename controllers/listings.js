const Listing = require("../models/listing");

/* ================= INDEX ================= */
/* ================= INDEX ================= */
module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});

  function autoCategorizeListing(listing) {
    const title = (listing.title || "").toLowerCase();
    const description = (listing.description || "").toLowerCase();
    const location = (listing.location || "").toLowerCase();
    const price = listing.price || 0;

    const categories = ["all"];

    if (price > 2000 || title.includes("luxury"))
      categories.push("trending");

    if (
      title.includes("room") ||
      title.includes("bed") ||
      title.includes("apartment")
    )
      categories.push("rooms");

    const cities = ["mumbai", "delhi", "pune", "bangalore", "chennai"];
    if (cities.some(c => location.includes(c) || title.includes(c)))
      categories.push("cities");

    if (title.includes("mountain") || description.includes("trek"))
      categories.push("mountains");

    if (
      title.includes("castle") ||
      description.includes("royal") ||
      description.includes("heritage")
    )
      categories.push("castles");

    if (title.includes("farm") || description.includes("village"))
      categories.push("farms");

    if (title.includes("beach") || description.includes("sea"))
      categories.push("beachfront");

    if (title.includes("pet") || description.includes("pet"))
      categories.push("pet-friendly");

    return [...new Set(categories)].join(",");
  }

  // attach categoryString to every listing
  allListings = allListings.map(listing => {
    const obj = listing.toObject();
    obj.categoryString = autoCategorizeListing(obj);
    return obj;
  });

  res.render("listings/index.ejs", {
    allListings,
    searchQuery: ""
  });
};



/* ================= NEW FORM ================= */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", {
    listing: {},    // empty listing for form fields
    errors: []      // ⚡ always define errors
  });
};



/* ================= CREATE ================= */
   module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  newListing.image = {
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  };

  await newListing.save();

  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
};


    // ✅ LOCAL IMAGE (NO CLOUDINARY)
  
/* ================= SHOW ================= */
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

/* ================= EDIT FORM ================= */
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

/* ================= UPDATE ================= */
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // ✅ If new image uploaded (local)
  if (req.file) {
    listing.image = {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

/* ================= DELETE ================= */
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
