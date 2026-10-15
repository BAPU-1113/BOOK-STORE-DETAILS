const mongoose = require("mongoose");

const allowedCategories = [
  "Fiction",
  "Non-Fiction",
  "Technology & Coding",
  "Self-Help",
  "Business & Finance",
  "Sci-Fi & Fantasy",
  "Mystery & Thriller",
  "Biography",
  "History",
  "Science & Nature",
  "Other",
];

/**
 * Validates request payload for creating a new book
 */
const validateBookCreation = (req, res, next) => {
  const { title, author, category, price, description } = req.body;

  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 2) {
    errors.push("Book title is required and must be at least 2 characters");
  }

  if (!author || typeof author !== "string" || author.trim().length < 2) {
    errors.push("Author name is required and must be at least 2 characters");
  }

  if (!category || !allowedCategories.includes(category)) {
    errors.push(`Category must be one of: ${allowedCategories.join(", ")}`);
  }

  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    errors.push("Price is required and must be a positive number");
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    errors.push("Description is required and must be at least 10 characters long");
  }

  if (req.body.rating !== undefined) {
    const rating = Number(req.body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push("Rating must be a number between 0 and 5");
    }
  }

  if (req.body.stock !== undefined) {
    const stock = Number(req.body.stock);
    if (isNaN(stock) || stock < 0) {
      errors.push("Stock cannot be negative");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors,
    });
  }

  next();
};

/**
 * Validates request payload when updating an existing book
 */
const validateBookUpdate = (req, res, next) => {
  const { title, author, category, price, rating, stock, description } = req.body;
  const errors = [];

  if (title !== undefined && (typeof title !== "string" || title.trim().length < 2)) {
    errors.push("Title must be at least 2 characters long");
  }

  if (author !== undefined && (typeof author !== "string" || author.trim().length < 2)) {
    errors.push("Author must be at least 2 characters long");
  }

  if (category !== undefined && !allowedCategories.includes(category)) {
    errors.push(`Category must be one of: ${allowedCategories.join(", ")}`);
  }

  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    errors.push("Price must be a positive number");
  }

  if (rating !== undefined) {
    const r = Number(rating);
    if (isNaN(r) || r < 0 || r > 5) {
      errors.push("Rating must be a number between 0 and 5");
    }
  }

  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    errors.push("Stock cannot be negative");
  }

  if (description !== undefined && (typeof description !== "string" || description.trim().length < 10)) {
    errors.push("Description must be at least 10 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors,
    });
  }

  next();
};

/**
 * Validates MongoDB ObjectId parameter
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid Book ID format: '${id}'`,
    });
  }
  next();
};

module.exports = {
  allowedCategories,
  validateBookCreation,
  validateBookUpdate,
  validateId,
};
