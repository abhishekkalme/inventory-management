const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    transactionType: {
      type: String,
      enum: {
        values: ["Purchase", "Restock"],
        message: "Transaction type must be Purchase or Restock",
      },
      required: [true, "Transaction type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      validate: {
        validator: (v) => Number.isInteger(v) && v > 0,
        message: "Quantity must be an integer greater than zero",
      },
    },
  },
  {
    timestamps: { createdAt: "transactionDate", updatedAt: false },
  }
);

transactionSchema.pre("validate", function (next) {
  if (!this.productId && this.productID) this.productId = this.productID;
  next();
});

transactionSchema.index({ productId: 1, transactionDate: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
