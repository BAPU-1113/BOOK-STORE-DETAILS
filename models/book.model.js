const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      minlength: [2, "Author name must be at least 2 characters long"],
    },
    category: {
      type: String,
      required: [true, "Book category is required"],
      enum: {
        values: [
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
        ],
        message: "{VALUE} is not a supported category",
      },
      default: "Other",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 4.5,
    },
    isbn: {
      type: String,
      trim: true,
      default: "",
    },
    publicationYear: {
      type: Number,
      min: [1800, "Publication year must be valid"],
      max: [2035, "Publication year cannot be in far future"],
      default: () => new Date().getFullYear(),
    },
    publisher: {
      type: String,
      trim: true,
      default: "Independent Press",
    },
    pages: {
      type: Number,
      min: [1, "Pages must be at least 1"],
      default: 250,
    },
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      default: 15,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    coverImage: {
      type: String,
      trim: true,
      default:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    },
    language: {
      type: String,
      default: "English",
      trim: true,
    },
    format: {
      type: String,
      enum: ["Paperback", "Hardcover", "E-Book", "Audiobook"],
      default: "Paperback",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Text index for search functionality
bookSchema.index({ title: "text", author: "text", description: "text" });

const BookModel = mongoose.model("Book", bookSchema);

module.exports = BookModel;
