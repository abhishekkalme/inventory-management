const express = require("express");
const {
  createProducts,
  getProducts,
  purchaseProducts,
  restockProducts,
  getProductHistory,
} = require("../controller/product.controller");
const { validate } = require("../middleware/validate");
const {
  createProductSchema,
  quantityOperationSchema,
  productIdParamSchema,
} = require("../validations/product.validation");

const router = express.Router();

router.post("/", validate(createProductSchema), createProducts);
router.get("/", getProducts);
router.post("/purchase", validate(quantityOperationSchema), purchaseProducts);
router.post("/restock", validate(quantityOperationSchema), restockProducts);
router.get("/:productId/history", validate(productIdParamSchema, "params"), getProductHistory);

module.exports = router;
