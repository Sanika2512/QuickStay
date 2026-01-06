// models/listing.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Image schema
const ImageSchema = new Schema({
  url: String,
  filename: String
});

// Listing schema
const ListingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  country: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: ImageSchema, // optional, will hold uploaded image
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User" // assuming you have a User model
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review" // assuming you have a Review model
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Listing", ListingSchema);
