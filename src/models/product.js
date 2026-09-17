const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
      minlength: [1, "Product name cannot be empty"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      validate: {
        validator: (v) => typeof v === "number" && v > 0,
        message: "Product price must be greater than zero",
      },
    },
    availableStock: {
      type: Number,
      required: [true, "Available stock is required"],
      min: [0, "Product stock cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("validate", function (next) {
  if (!this.productName && this.name) this.productName = this.name;
  if (this.availableStock === undefined && this.stock !== undefined) {
    this.availableStock = this.stock;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
