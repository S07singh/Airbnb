const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
    type: Schema.Types.ObjectId,
    ref: "Review"  // refers to the Review model by its id
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"  // refers to the User model by its id
    },
});

listingSchema.post("findOneAndDelete", async(listing) => {
  if(listing) {
    await Review.deleteMany({ _id: {$in: listing.reviews}}); // delete all reviews associated with the deleted listing
  }
})


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;