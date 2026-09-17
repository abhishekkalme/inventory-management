const { z } = require("zod");
const mongoose = require("mongoose");

const objectId = z
  .string({ required_error: "Product ID is required" })
  .trim()
  .min(1, "Product ID is required")
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    message: "Invalid product ID format",
  });

const createProductSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required").optional(),
  name: z.string().trim().min(1, "Product name is required").optional(),
  price: z
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .gt(0, "Product price must be greater than zero"),
  availableStock: z
    .number({ invalid_type_error: "Available stock must be a number" })
    .int("Available stock must be an integer")
    .min(0, "Product stock cannot be negative")
    .optional(),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .min(0, "Product stock cannot be negative")
    .optional(),
}).superRefine((data, ctx) => {
  if (!data.productName && !data.name) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Product name is required", path: ["productName"] });
  }
  if (data.availableStock === undefined && data.stock === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Available stock is required", path: ["availableStock"] });
  }
});

const quantityOperationSchema = z.object({
  productId: objectId.optional(),
  productID: objectId.optional(),
  id: objectId.optional(),
  quantity: z
    .number({ required_error: "Quantity is required", invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .gt(0, "Quantity must be greater than zero"),
}).superRefine((data, ctx) => {
  if (!data.productId && !data.productID && !data.id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Product ID is required", path: ["productId"] });
  }
});

const productIdParamSchema = z.object({
  productId: objectId,
});

module.exports = {
  createProductSchema,
  quantityOperationSchema,
  productIdParamSchema,
};
