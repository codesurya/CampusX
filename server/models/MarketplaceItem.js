const mongoose = require("mongoose");

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Books", "Electronics", "Stationery", "Cycles/Vehicles", "Dorm/Hostel", "Other"],
      default: "Books",
    },
    price: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: ["Brand New", "Like New", "Good", "Fair"],
      default: "Good",
    },
    sellerName: { type: String, required: true, trim: true },
    contactInfo: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketplaceItem", marketplaceItemSchema);

