const mongoose = require("mongoose");
const Product = require("../models/product");
const Transaction = require("../models/transaction");
const { asyncHandler } = require("../middleware/validate");

const normalizeName = (body) => body.productName || body.name;
const normalizeStock = (body) =>
  body.availableStock !== undefined ? body.availableStock : body.stock;
const normalizeId = (body) => body.productId || body.productID || body.id;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProducts = asyncHandler(async (req, res) => {
  const productName = normalizeName(req.body);
  const availableStock = normalizeStock(req.body);
  const { price } = req.body;

  try {
    const product = await Product.create({ productName, price, availableStock });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Product name must be unique" });
    }
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    throw err;
  }
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: products.length, products });
});

const purchaseProducts = asyncHandler(async (req, res) => {
  const productId = normalizeId(req.body);
  const { quantity } = req.body;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID format" });
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, availableStock: { $gte: quantity } },
    { $inc: { availableStock: -quantity } },
    { new: true }
  );

  if (!product) {
    const exists = await Product.findById(productId).lean();
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(400).json({
      success: false,
      message: "Insufficient stock: requested quantity exceeds available stock",
      availableStock: exists.availableStock,
    });
  }

  try {
    const transaction = await Transaction.create({
      productId: product._id,
      transactionType: "Purchase",
      quantity,
    });
    return res.status(200).json({ success: true, message: "Purchase successful", product, transaction });
  } catch (err) {
    await Product.findByIdAndUpdate(productId, { $inc: { availableStock: quantity } });
    throw err;
  }
});

const restockProducts = asyncHandler(async (req, res) => {
  const productId = normalizeId(req.body);
  const { quantity } = req.body;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID format" });
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { availableStock: quantity } },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  try {
    const transaction = await Transaction.create({
      productId: product._id,
      transactionType: "Restock",
      quantity,
    });
    return res.status(200).json({
      success: true,
      message: "Product restocked successfully",
      product,
      transaction,
    });
  } catch (err) {
    await Product.findByIdAndUpdate(productId, { $inc: { availableStock: -quantity } });
    throw err;
  }
});

const getProductHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID format" });
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const history = await Transaction.find({ productId })
    .sort({ transactionDate: -1 })
    .lean();

  res.status(200).json({
    success: true,
    product: { id: product._id, productName: product.productName, availableStock: product.availableStock },
    count: history.length,
    history,
  });
});

module.exports = {
  createProducts,
  getProducts,
  purchaseProducts,
  restockProducts,
  getProductHistory,
};
