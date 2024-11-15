const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to MongoDB");
})
 .catch((error) => 

 console.log("Error connecting to MongoDB:", error)
);


async function main() {   
        await mongoose.connect(MONGO_URL);      
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) =>{
    res.send ("Hi, I am root!");
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
}

// Index Route
app.get("/listings", wrapAsync(async (req, res) =>{ 
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", {allListings});
}));

// New Route
app.get("/listings/new", (req, res) =>{
    res.render("listings/new.ejs");
});

// show Route

app.get("/listings/:id", wrapAsync(async (req, res) =>{
    const listing = await Listing.findById(req.params.id);
    res.render("listings/show.ejs", {listing});
}));

// Create Route

app.post("/listings", validateListing,
    wrapAsync(async (req, res) => {
        // let result = listingSchema.validate(req.body);
        // if (result.error) {
        //     throw new ExpressError(result.error.details[0].message, 400);
        // }
    const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
       
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }));
  
  //Update Route
  app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }));
  
// app.get("/testListing", async (req, res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "BY the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country:  "India",

//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.use("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((req, res, err, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {err})
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
