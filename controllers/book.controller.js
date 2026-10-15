const BookModel = require("../models/book.model");

/**
 * @desc    Create a new book record
 * @route   POST /api/books
 */
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      price,
      discountPrice,
      rating,
      isbn,
      publicationYear,
      publisher,
      pages,
      stock,
      description,
      coverImage,
      language,
      format,
      featured,
    } = req.body;

    // Check for duplicate title (case-insensitive)
    const existingBook = await BookModel.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: `A book with title "${title}" already exists in the catalog`,
      });
    }

    const newBook = new BookModel({
      title: title.trim(),
      author: author.trim(),
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      rating: rating !== undefined ? Number(rating) : 4.5,
      isbn: isbn ? isbn.trim() : "",
      publicationYear: publicationYear ? Number(publicationYear) : new Date().getFullYear(),
      publisher: publisher ? publisher.trim() : "Independent Press",
      pages: pages ? Number(pages) : 250,
      stock: stock !== undefined ? Number(stock) : 10,
      description: description.trim(),
      coverImage:
        coverImage && coverImage.trim() !== ""
          ? coverImage.trim()
          : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      language: language ? language.trim() : "English",
      format: format || "Paperback",
      featured: Boolean(featured),
    });

    const savedBook = await newBook.save();

    return res.status(201).json({
      success: true,
      message: "Book added to catalog successfully",
      book: savedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating book",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all books with search, filtering, and sorting
 * @route   GET /api/books
 */
const getAllBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      featured,
    } = req.query;

    const filter = {};

    // Category filter
    if (category && category !== "All") {
      filter.category = category;
    }

    // Featured filter
    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Min rating
    if (minRating !== undefined && !isNaN(Number(minRating))) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Search keyword in title, author, isbn
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex },
        { description: searchRegex },
      ];
    }

    // Sorting option
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sortBy === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sortBy === "price_desc") {
      sortOptions = { price: -1 };
    } else if (sortBy === "rating_desc") {
      sortOptions = { rating: -1 };
    } else if (sortBy === "title_asc") {
      sortOptions = { title: 1 };
    } else if (sortBy === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const books = await BookModel.find(filter).sort(sortOptions);
    const totalCount = await BookModel.countDocuments();

    return res.status(200).json({
      success: true,
      count: books.length,
      totalCatalogSize: totalCount,
      books,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving books",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single book details by ID
 * @route   GET /api/books/:id
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving book details",
      error: error.message,
    });
  }
};

/**
 * @desc    Update book details by ID
 * @route   PUT/PATCH /api/books/:id
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check duplicate title if title changed
    if (updateData.title) {
      const duplicate = await BookModel.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${updateData.title.trim()}$`, "i") },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another book with title "${updateData.title}" already exists`,
        });
      }
    }

    // Number conversions if needed
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = updateData.discountPrice ? Number(updateData.discountPrice) : null;
    }
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.pages !== undefined) updateData.pages = Number(updateData.pages);
    if (updateData.publicationYear !== undefined) {
      updateData.publicationYear = Number(updateData.publicationYear);
    }

    const updatedBook = await BookModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: `Book not found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating book",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a book by ID
 * @route   DELETE /api/books/:id
 */
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await BookModel.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: `Book not found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Book "${deletedBook.title}" deleted successfully`,
      deletedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting book",
      error: error.message,
    });
  }
};

/**
 * @desc    Get dashboard statistics for the bookstore
 * @route   GET /api/books/stats/summary
 */
const getStoreStats = async (req, res) => {
  try {
    const books = await BookModel.find();

    const totalBooks = books.length;
    let totalInventoryValue = 0;
    let totalStock = 0;
    let totalRatingSum = 0;
    const categoriesMap = {};

    books.forEach((b) => {
      totalStock += b.stock || 0;
      totalInventoryValue += (b.price || 0) * (b.stock || 1);
      totalRatingSum += b.rating || 0;

      categoriesMap[b.category] = (categoriesMap[b.category] || 0) + 1;
    });

    const averageRating = totalBooks > 0 ? (totalRatingSum / totalBooks).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalTitles: totalBooks,
        totalStockUnits: totalStock,
        totalInventoryValue: Math.round(totalInventoryValue),
        averageRating: Number(averageRating),
        categoriesBreakdown: categoriesMap,
        categoriesCount: Object.keys(categoriesMap).length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate store statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk delete books by category
 * @route   DELETE /api/books/category/:category
 */
const bulkDeleteByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await BookModel.deleteMany({ category });

    return res.status(200).json({
      success: true,
      message: `All books under category "${category}" deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while bulk deleting books",
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getStoreStats,
  bulkDeleteByCategory,
};
