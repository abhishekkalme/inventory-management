# Inventory Management System

REST API to manage product inventory built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

## Features

- Create products (unique name, price > 0, stock >= 0)
- List all products
- Purchase products (atomic stock decrement, rejects over-purchase)
- Restock products (atomic stock increment)
- Transaction history per product (Purchase / Restock)

## Project Structure

```
src/
├── app.js                      # Express app + middleware wiring
├── server.js                   # Entry point (DB connect + listen)
├── config/
│   └── db.js                   # MongoDB connection
├── models/
│   ├── product.js              # Product schema
│   └── transaction.js          # Transaction schema
├── controller/
│   └── product.controller.js   # Business logic
├── routes/
│   └── product.routes.js       # Route definitions
├── middleware/
│   ├── validate.js             # asyncHandler + zod validate()
│   └── errorHandler.js         # 404 + central error handler
└── validations/
    └── product.validation.js   # zod schemas
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env and set MONGO_URI (and PORT optionally)

# 3. Run the server
npm start        # production
npm run dev      # watch mode (Node 18+)
```

Server runs at `http://localhost:5000` (or the `PORT` you set).

## Environment Variables

| Variable    | Required | Description                          |
| ----------- | -------- | ------------------------------------ |
| `MONGO_URI` | Yes      | MongoDB connection string            |
| `PORT`      | No       | Port to listen on (default `3000`)   |

See [.env.example](./.env.example).

## API Reference

Base URL: `http://localhost:<PORT>`

### POST /products — Create a product

```json
{
  "productName": "Laptop",
  "price": 55000,
  "availableStock": 10
}
```

Rules: `productName` unique (aliases: `name`), `price` > 0, `availableStock` >= 0 (alias: `stock`).
Responses: `201` created · `400` validation error · `409` duplicate name.

### GET /products — List all products

Response `200`:

```json
{ "success": true, "count": 2, "products": [...] }
```

### POST /products/purchase — Purchase a product

```json
{ "productId": "<PRODUCT_ID>", "quantity": 2 }
```

Rules: `quantity` integer > 0; rejected with `400` if it exceeds available stock; stock is decremented atomically and a `Purchase` transaction is recorded.
Responses: `200` ok · `400` insufficient stock / validation · `404` product not found.

### POST /products/restock — Restock a product

```json
{ "productId": "<PRODUCT_ID>", "quantity": 5 }
```

Rules: `quantity` integer > 0; stock is incremented atomically and a `Restock` transaction is recorded.
Responses: `200` ok · `400` validation · `404` product not found.

### GET /products/:productId/history — Transaction history

Response `200`:

```json
{
  "success": true,
  "product": { "id": "...", "productName": "Laptop", "availableStock": 13 },
  "count": 2,
  "history": [...]
}
```

Responses: `200` ok · `400` invalid ID · `404` product not found.

## Database Schema

**Product**

| Field            | Type   | Constraints                          |
| ---------------- | ------ | ------------------------------------ |
| `productName`    | String | required, unique, trimmed            |
| `price`          | Number | required, must be > 0                |
| `availableStock` | Number | required, >= 0, default 0            |
| timestamps       | —      | `createdAt`, `updatedAt` auto-managed |

**Transaction**

| Field             | Type     | Constraints                              |
| ----------------- | -------- | ---------------------------------------- |
| `productId`       | ObjectId | required, ref `Product`, indexed         |
| `transactionType` | String   | required, enum `Purchase` / `Restock`    |
| `quantity`        | Number   | required, integer > 0                    |
| `transactionDate` | Date     | auto (via timestamps `createdAt` alias)  |

## Error Format

```json
{ "success": false, "message": "Insufficient stock: requested quantity exceeds available stock" }
```

Validation errors include an `errors` array: `[{ "field": "price", "message": "..." }]`.

## Quick Manual Test (curl)

```bash
BASE=http://localhost:5000

# create
curl -s -X POST $BASE/products -H "Content-Type: application/json" \
  -d '{"productName":"Laptop","price":55000,"availableStock":10}'

# list
curl -s $BASE/products

# purchase (replace ID)
curl -s -X POST $BASE/products/purchase -H "Content-Type: application/json" \
  -d '{"productId":"<ID>","quantity":2}'

# restock
curl -s -X POST $BASE/products/restock -H "Content-Type: application/json" \
  -d '{"productId":"<ID>","quantity":5}'

# history
curl -s $BASE/products/<ID>/history
```

## Notes

- Purchase uses an atomic `findOneAndUpdate` with an `availableStock >= quantity` guard, so concurrent purchases cannot oversell.
- If writing the transaction record fails after a stock update, the stock change is compensated (rolled back) automatically.
