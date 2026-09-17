const express = require("express");
const productRoutes = require("./routes/product.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Inventory Management API is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", uptime: process.uptime() });
});

app.use("/products", productRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
