# 📚 PageCraft - Book Store Details & Inventory Management System

A full-stack, production-ready Book Store Catalog and Inventory Management System built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, featuring a clean, responsive modern web interface and robust RESTful API with middleware validations.

---

## 🌟 Key Features

1. **Complete Book Details Management (CRUD)**:
   - **Create**: Add new books with comprehensive metadata (Title, Author, Category, Pricing, Rating, ISBN, Stock, Publisher, Format, Cover, Synopsis).
   - **Read**: Explore all books, inspect detailed view modal, live search, and genre filtering.
   - **Update**: Edit existing book records, adjust prices, stock, and descriptions.
   - **Delete**: Safely delete book records with confirmation modal.

2. **Smart Search & Advanced Filtering**:
   - Instant search across **Title**, **Author**, **ISBN**, and keywords.
   - Category filter pills with single-click filtering.
   - Sorting by: **Newest**, **Highest Rated**, **Price (Low to High)**, **Price (High to Low)**, and **Title (A-Z)**.

3. **Real-time Inventory Analytics**:
   - Live dashboard computing total catalog titles, stock unit counts, total inventory valuation (₹), and average store rating from MongoDB.

4. **Middleware & Schema Validations**:
   - Schema-level constraints via Mongoose (lengths, enums, required fields, price minimums).
   - Custom Express validation middleware (`validateBookCreation`, `validateBookUpdate`, `validateId`).
   - Duplicate title detection preventing accidental duplicate entries.

5. **Modern, Responsive Frontend**:
   - Built with clean semantic HTML5, modern CSS3 variables, glassmorphism accents, and vanilla JavaScript.
   - Zero compilation/build steps needed; opens instantly in any browser.

---

## 🛠️ Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Environment**: Dotenv for configuration
- **Frontend**: HTML5, Modern CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6+ Fetch API)
- **Icons & Typography**: FontAwesome 6, Google Fonts (*Plus Jakarta Sans* & *Playfair Display*)

---

## 📂 Project Architecture

```
book store detail/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   └── book.controller.js    # Business logic & CRUD handlers
├── middleware/
│   └── book.middleware.js    # Request validation & ID sanitization
├── models/
│   └── book.model.js         # Mongoose schema & text indexes
├── public/
│   ├── index.html            # Main web user interface
│   ├── style.css             # Responsive styling & themes
│   └── app.js                # Frontend client logic & API consumption
├── routes/
│   └── book.routes.js        # RESTful API route definitions
├── .env                      # Environment configuration
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── app.js                    # Express app initialization & server entry
├── package.json              # Project dependencies & scripts
├── seed.js                   # Pre-populates database with sample books
└── README.md                 # Project documentation
```

---

## 🔌 RESTful API Reference

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | Get all books (supports query params: `search`, `category`, `sortBy`) | `200 OK` |
| `GET` | `/api/books/:id` | Get details of a single book by ID | `200 OK` |
| `POST` | `/api/books` | Add a new book (with validation middleware) | `201 Created` |
| `PUT` | `/api/books/:id` | Update an existing book record | `200 OK` |
| `DELETE` | `/api/books/:id` | Remove a book from store catalog | `200 OK` |
| `GET` | `/api/books/stats` | Retrieve aggregated store statistics & inventory valuation | `200 OK` |
| `GET` | `/api/health` | Service health status check | `200 OK` |

### Sample JSON Payload for Creating a Book (`POST /api/books`):
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Technology & Coding",
  "price": 649,
  "discountPrice": 549,
  "rating": 4.8,
  "stock": 25,
  "publicationYear": 2008,
  "publisher": "Prentice Hall",
  "pages": 464,
  "format": "Paperback",
  "isbn": "978-0132350884",
  "coverImage": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a",
  "description": "A handbook of agile software craftsmanship for creating maintainable, high quality code."
}
```

---

## 🚀 How to Run the Project

### 1. Prerequisites
Ensure you have **Node.js** (v16+) and **MongoDB** installed and running on your system.

### 2. Install Dependencies
```bash
npm install
```

### 3. Populate Sample Data (Optional)
To load initial curated books into MongoDB:
```bash
npm run seed
```

### 4. Start the Application Server
```bash
npm start
```

### 5. Access the Project in Browser
Open: [http://localhost:5000](http://localhost:5000)
