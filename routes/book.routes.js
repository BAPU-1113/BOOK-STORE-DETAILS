const express = require("express");
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getStoreStats,
  bulkDeleteByCategory,
} = require("../controllers/book.controller");

const {
  validateBookCreation,
  validateBookUpdate,
  validateId,
} = require("../middleware/book.middleware");

// Statistics Route (must be before /:id)
router.get("/stats/summary", getStoreStats);
router.get("/stats", getStoreStats);

// Bulk delete by category (must be before /:id)
router.delete("/category/:category", bulkDeleteByCategory);

// Core CRUD Routes
router.get("/", getAllBooks);
router.get("/:id", validateId, getBookById);
router.post("/", validateBookCreation, createBook);
router.put("/:id", validateId, validateBookUpdate, updateBook);
router.patch("/:id", validateId, validateBookUpdate, updateBook);
router.delete("/:id", validateId, deleteBook);

module.exports = router;
