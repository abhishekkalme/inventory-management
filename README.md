# Inventory Management System

A simple REST API to manage product inventory. Built with Node.js, Express.js and MongoDB (Mongoose).

## What it does

- Add new products
- See all products
- Buy products (checks stock first, so you can't buy more than what's available)
- Restock products
- See buy/restock history of any product

## Folder structure

```
src/
  app.js                  - sets up the express app
  server.js               - starts the server
  config/db.js            - connects to MongoDB
  models/                 - product and transaction database tables
  controller/             - main logic (buy, restock, etc.)
  routes/                 - API routes
  middleware/             - error handling and validation
  validations/            - input checking rules
```

## How to run

1. Install everything:

```
npm install
```

2. Make a `.env` file (see `.env.example`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
```

3. Start the server:

```
npm start
```

That's it. The API will run on `http://localhost:5000`.

## API list

### 1. Add a product

```
POST /products
```

Send this:

```json
{
  "productName": "Laptop",
  "price": 55000,
  "availableStock": 10
}
```

Rules: name must be unique, price must be more than 0, stock can't be negative.

### 2. Get all products

```
GET /products
```

### 3. Buy a product

```
POST /products/purchase
```

Send this:

```json
{
  "productId": "PRODUCT_ID_HERE",
  "quantity": 2
}
```

If you ask for more than the available stock, you'll get an error. Stock goes down on every successful buy.

### 4. Restock a product

```
POST /products/restock
```

Send this:

```json
{
  "productId": "PRODUCT_ID_HERE",
  "quantity": 5
}
```

Stock goes up on every successful restock.

### 5. See history of a product

```
GET /products/PRODUCT_ID_HERE/history
```

Shows all buy and restock records for that product.
