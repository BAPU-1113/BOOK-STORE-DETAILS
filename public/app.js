/**
 * PageCraft Book Store Details & Inventory Management
 * Frontend Client JavaScript
 */

// Application State
const state = {
  books: [],
  filteredBooks: [],
  currentCategory: "All",
  searchQuery: "",
  sortBy: "newest",
  activeBookForAction: null,
};

// DOM Elements
const elements = {
  bookGrid: document.getElementById("bookGrid"),
  emptyState: document.getElementById("emptyState"),
  displayedCount: document.getElementById("displayedCount"),
  categoryPills: document.getElementById("categoryPills"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  sortBySelect: document.getElementById("sortBySelect"),
  refreshBtn: document.getElementById("refreshBtn"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  activeFilterBadge: document.getElementById("activeFilterBadge"),
  badgeCategoryText: document.getElementById("badgeCategoryText"),
  removeCategoryFilter: document.getElementById("removeCategoryFilter"),
  
  // Navigation Stats
  navTotalBooks: document.getElementById("navTotalBooks"),
  navTotalCategories: document.getElementById("navTotalCategories"),
  navAvgRating: document.getElementById("navAvgRating"),
  catCountAll: document.getElementById("catCountAll"),

  // Overview Stats
  statTotalTitles: document.getElementById("statTotalTitles"),
  statTotalStock: document.getElementById("statTotalStock"),
  statInventoryVal: document.getElementById("statInventoryVal"),
  statAvgRating: document.getElementById("statAvgRating"),

  // Modals
  detailsModal: document.getElementById("detailsModal"),
  detailsModalContent: document.getElementById("detailsModalContent"),
  closeDetailsModalBtn: document.getElementById("closeDetailsModalBtn"),
  closeDetailsModalBtn2: document.getElementById("closeDetailsModalBtn2"),
  detailsEditBtn: document.getElementById("detailsEditBtn"),

  bookFormModal: document.getElementById("bookFormModal"),
  formModalTitle: document.getElementById("formModalTitle"),
  bookForm: document.getElementById("bookForm"),
  formBookId: document.getElementById("formBookId"),
  openAddModalBtn: document.getElementById("openAddModalBtn"),
  closeFormModalBtn: document.getElementById("closeFormModalBtn"),
  cancelFormBtn: document.getElementById("cancelFormBtn"),

  deleteConfirmModal: document.getElementById("deleteConfirmModal"),
  deleteBookTitle: document.getElementById("deleteBookTitle"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  closeDeleteModalBtn: document.getElementById("closeDeleteModalBtn"),

  // API Docs Toggle
  apiDocsSection: document.getElementById("apiDocsSection"),
  toggleApiDocs: document.getElementById("toggleApiDocs"),
  apiDocsBody: document.getElementById("apiDocsBody"),
  apiToggleText: document.getElementById("apiToggleText"),
  apiToggleIcon: document.getElementById("apiToggleIcon"),
  viewApiDocsBtn: document.getElementById("viewApiDocsBtn"),

  // Toast Container
  toastContainer: document.getElementById("toastContainer"),
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  loadData();
});

function initEventListeners() {
  // Search input live handling
  let debounceTimeout;
  elements.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    elements.clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      loadBooks();
    }, 300);
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    state.searchQuery = "";
    elements.clearSearchBtn.style.display = "none";
    loadBooks();
  });

  // Sort dropdown
  elements.sortBySelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    loadBooks();
  });

  // Category Pills delegation
  elements.categoryPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill-btn");
    if (!pill) return;

    document.querySelectorAll(".pill-btn").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    state.currentCategory = pill.dataset.category;
    updateActiveFilterUI();
    loadBooks();
  });

  // Remove category filter badge click
  elements.removeCategoryFilter.addEventListener("click", () => {
    resetCategoryFilter();
  });

  // Refresh and reset
  elements.refreshBtn.addEventListener("click", () => {
    loadData();
    showToast("Catalog refreshed from database", "info");
  });

  elements.resetFiltersBtn.addEventListener("click", () => {
    resetAllFilters();
  });

  // Modal open/close controls
  elements.openAddModalBtn.addEventListener("click", () => openAddModal());
  elements.closeFormModalBtn.addEventListener("click", () => closeModal(elements.bookFormModal));
  elements.cancelFormBtn.addEventListener("click", () => closeModal(elements.bookFormModal));

  elements.closeDetailsModalBtn.addEventListener("click", () => closeModal(elements.detailsModal));
  elements.closeDetailsModalBtn2.addEventListener("click", () => closeModal(elements.detailsModal));
  
  elements.detailsEditBtn.addEventListener("click", () => {
    const bookId = state.activeBookForAction?._id;
    closeModal(elements.detailsModal);
    if (bookId) openEditModal(bookId);
  });

  elements.closeDeleteModalBtn.addEventListener("click", () => closeModal(elements.deleteConfirmModal));
  elements.cancelDeleteBtn.addEventListener("click", () => closeModal(elements.deleteConfirmModal));
  elements.confirmDeleteBtn.addEventListener("click", () => handleConfirmDelete());

  // Form submission
  elements.bookForm.addEventListener("submit", (e) => handleFormSubmit(e));

  // Quick preset image buttons
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.getElementById("bookCoverImage").value = e.target.dataset.url;
    });
  });

  // API Docs toggle
  elements.toggleApiDocs.addEventListener("click", toggleApiDocsSection);
  elements.viewApiDocsBtn.addEventListener("click", () => {
    elements.apiDocsSection.scrollIntoView({ behavior: "smooth" });
    if (elements.apiDocsBody.style.display === "none") {
      toggleApiDocsSection();
    }
  });

  // Escape key closes modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(elements.detailsModal);
      closeModal(elements.bookFormModal);
      closeModal(elements.deleteConfirmModal);
    }
  });
}

// ==========================================
// Data Fetching
// ==========================================
async function loadData() {
  await Promise.all([loadBooks(), loadStats()]);
}

async function loadBooks() {
  try {
    elements.bookGrid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Fetching book catalog from MongoDB...</p>
      </div>
    `;
    elements.emptyState.style.display = "none";

    const params = new URLSearchParams();
    if (state.currentCategory && state.currentCategory !== "All") {
      params.append("category", state.currentCategory);
    }
    if (state.searchQuery) {
      params.append("search", state.searchQuery);
    }
    if (state.sortBy) {
      params.append("sortBy", state.sortBy);
    }

    const response = await fetch(`/api/books?${params.toString()}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load books");
    }

    state.books = data.books || [];
    renderBooks(state.books);

    elements.displayedCount.textContent = state.books.length;
    if (elements.catCountAll) {
      elements.catCountAll.textContent = data.totalCatalogSize || state.books.length;
    }
  } catch (error) {
    console.error("Load Books Error:", error);
    elements.bookGrid.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; color: var(--danger); margin-bottom: 0.75rem;"></i>
        <h4>Error Loading Books</h4>
        <p style="color: var(--text-muted);">${error.message}</p>
        <button class="btn btn-outline btn-sm" onclick="loadBooks()" style="margin-top: 1rem;">
          <i class="fa-solid fa-rotate-right"></i> Try Again
        </button>
      </div>
    `;
  }
}

async function loadStats() {
  try {
    const response = await fetch("/api/books/stats");
    const data = await response.json();

    if (data.success && data.stats) {
      const stats = data.stats;
      elements.navTotalBooks.textContent = stats.totalTitles || 0;
      elements.navTotalCategories.textContent = stats.categoriesCount || 0;
      elements.navAvgRating.textContent = stats.averageRating ? `${stats.averageRating}★` : "--";

      elements.statTotalTitles.textContent = stats.totalTitles || 0;
      elements.statTotalStock.textContent = `${stats.totalStockUnits || 0} units`;
      elements.statInventoryVal.textContent = `₹${(stats.totalInventoryValue || 0).toLocaleString("en-IN")}`;
      elements.statAvgRating.textContent = `${stats.averageRating || 0} / 5.0`;
    }
  } catch (error) {
    console.warn("Stats Load Warning:", error.message);
  }
}

// ==========================================
// Rendering Functions
// ==========================================
function renderBooks(books) {
  if (!books || books.length === 0) {
    elements.bookGrid.innerHTML = "";
    elements.emptyState.style.display = "block";
    return;
  }

  elements.emptyState.style.display = "none";
  elements.bookGrid.innerHTML = books.map((book) => createBookCardHTML(book)).join("");

  // Attach card event listeners
  document.querySelectorAll(".card-btn-view").forEach((btn) => {
    btn.addEventListener("click", () => openDetailsModal(btn.dataset.id));
  });

  document.querySelectorAll(".card-btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll(".card-btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id, btn.dataset.title));
  });
}

function createBookCardHTML(book) {
  const coverImage =
    book.coverImage ||
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";

  const discountBadge = book.discountPrice
    ? `<span class="original-price">₹${book.price}</span>`
    : "";

  const displayPrice = book.discountPrice || book.price;

  return `
    <article class="book-card" data-id="${book._id}">
      <div class="card-cover-wrapper">
        <img src="${escapeHTML(coverImage)}" alt="${escapeHTML(book.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';" />
        <div class="card-badges">
          <span class="badge-category">${escapeHTML(book.category || "General")}</span>
          <span class="badge-rating">
            <i class="fa-solid fa-star"></i> ${book.rating ? Number(book.rating).toFixed(1) : "4.5"}
          </span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-author">${escapeHTML(book.author)}</div>
        <h3 class="card-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</h3>
        <p class="card-description">${escapeHTML(book.description)}</p>
        
        <div class="card-meta-chips">
          <span class="meta-chip"><i class="fa-solid fa-book-journal-whills"></i> ${escapeHTML(book.format || "Paperback")}</span>
          <span class="meta-chip"><i class="fa-regular fa-calendar"></i> ${book.publicationYear || "2023"}</span>
          <span class="meta-chip"><i class="fa-solid fa-cubes"></i> ${book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}</span>
        </div>

        <div class="card-footer">
          <div class="price-box">
            <span class="current-price">₹${displayPrice}</span>
            ${discountBadge}
          </div>
          <div class="card-actions">
            <button class="action-btn card-btn-view" data-id="${book._id}" title="View Full Details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn card-btn-edit" data-id="${book._id}" title="Edit Book">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="action-btn btn-delete card-btn-delete" data-id="${book._id}" data-title="${escapeHTML(book.title)}" title="Delete Book">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ==========================================
// Details Modal
// ==========================================
async function openDetailsModal(bookId) {
  try {
    let book = state.books.find((b) => b._id === bookId);
    if (!book) {
      const res = await fetch(`/api/books/${bookId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      book = data.book;
    }

    state.activeBookForAction = book;

    const coverImage =
      book.coverImage ||
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";

    const displayPrice = book.discountPrice || book.price;
    const discountElement = book.discountPrice
      ? `<span class="details-discount">Original: ₹${book.price} (Save ₹${book.price - book.discountPrice})</span>`
      : "";

    elements.detailsModalContent.innerHTML = `
      <div class="details-layout">
        <div>
          <img class="details-cover" src="${escapeHTML(coverImage)}" alt="${escapeHTML(book.title)}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';" />
        </div>
        <div class="details-info">
          <div class="details-header">
            <span class="details-category">${escapeHTML(book.category)}</span>
            <h2 class="details-title">${escapeHTML(book.title)}</h2>
            <p class="details-author">By <strong>${escapeHTML(book.author)}</strong></p>
          </div>

          <div class="details-pricing">
            <span class="details-price">₹${displayPrice}</span>
            ${discountElement}
          </div>

          <div class="details-specs">
            <div class="spec-item"><span class="spec-label">Rating:</span> <span class="spec-value">⭐ ${book.rating || "4.5"} / 5.0</span></div>
            <div class="spec-item"><span class="spec-label">Format:</span> <span class="spec-value">${escapeHTML(book.format || "Paperback")}</span></div>
            <div class="spec-item"><span class="spec-label">Pages:</span> <span class="spec-value">${book.pages || "N/A"} pages</span></div>
            <div class="spec-item"><span class="spec-label">Language:</span> <span class="spec-value">${escapeHTML(book.language || "English")}</span></div>
            <div class="spec-item"><span class="spec-label">Publisher:</span> <span class="spec-value">${escapeHTML(book.publisher || "Independent")}</span></div>
            <div class="spec-item"><span class="spec-label">Year:</span> <span class="spec-value">${book.publicationYear || "N/A"}</span></div>
            <div class="spec-item"><span class="spec-label">ISBN:</span> <span class="spec-value">${escapeHTML(book.isbn || "Not Registered")}</span></div>
            <div class="spec-item"><span class="spec-label">Stock Status:</span> <span class="spec-value" style="color: ${book.stock > 0 ? "var(--success)" : "var(--danger)"};">${book.stock > 0 ? `${book.stock} units available` : "Out of stock"}</span></div>
          </div>

          <div class="details-synopsis">
            <h4>Book Synopsis</h4>
            <p>${escapeHTML(book.description)}</p>
          </div>
        </div>
      </div>
    `;

    openModal(elements.detailsModal);
  } catch (error) {
    showToast("Failed to load book details: " + error.message, "error");
  }
}

// ==========================================
// Add / Edit Modal & Form Handling
// ==========================================
function openAddModal() {
  elements.formModalTitle.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Add New Book to Store`;
  elements.bookForm.reset();
  elements.formBookId.value = "";
  document.getElementById("bookRating").value = "4.5";
  document.getElementById("bookStock").value = "15";
  document.getElementById("bookYear").value = new Date().getFullYear();
  document.getElementById("bookPages").value = "300";
  document.getElementById("bookPublisher").value = "Independent Press";
  openModal(elements.bookFormModal);
}

function openEditModal(bookId) {
  const book = state.books.find((b) => b._id === bookId);
  if (!book) return;

  elements.formModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Book Details`;
  elements.formBookId.value = book._id;
  document.getElementById("bookTitle").value = book.title || "";
  document.getElementById("bookAuthor").value = book.author || "";
  document.getElementById("bookCategory").value = book.category || "Fiction";
  document.getElementById("bookPrice").value = book.price || "";
  document.getElementById("bookDiscountPrice").value = book.discountPrice || "";
  document.getElementById("bookRating").value = book.rating || 4.5;
  document.getElementById("bookStock").value = book.stock !== undefined ? book.stock : 10;
  document.getElementById("bookYear").value = book.publicationYear || new Date().getFullYear();
  document.getElementById("bookPages").value = book.pages || 250;
  document.getElementById("bookPublisher").value = book.publisher || "Independent Press";
  document.getElementById("bookFormat").value = book.format || "Paperback";
  document.getElementById("bookIsbn").value = book.isbn || "";
  document.getElementById("bookCoverImage").value = book.coverImage || "";
  document.getElementById("bookFeatured").checked = Boolean(book.featured);
  document.getElementById("bookDescription").value = book.description || "";

  openModal(elements.bookFormModal);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const id = elements.formBookId.value;
  const isEditing = Boolean(id);

  const payload = {
    title: document.getElementById("bookTitle").value.trim(),
    author: document.getElementById("bookAuthor").value.trim(),
    category: document.getElementById("bookCategory").value,
    price: Number(document.getElementById("bookPrice").value),
    discountPrice: document.getElementById("bookDiscountPrice").value
      ? Number(document.getElementById("bookDiscountPrice").value)
      : null,
    rating: Number(document.getElementById("bookRating").value) || 4.5,
    stock: Number(document.getElementById("bookStock").value) || 0,
    publicationYear: Number(document.getElementById("bookYear").value) || 2023,
    pages: Number(document.getElementById("bookPages").value) || 250,
    publisher: document.getElementById("bookPublisher").value.trim() || "Independent Press",
    format: document.getElementById("bookFormat").value,
    isbn: document.getElementById("bookIsbn").value.trim(),
    coverImage: document.getElementById("bookCoverImage").value.trim(),
    featured: document.getElementById("bookFeatured").checked,
    description: document.getElementById("bookDescription").value.trim(),
  };

  try {
    const url = isEditing ? `/api/books/${id}` : "/api/books";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.errors ? data.errors.join(", ") : data.message;
      throw new Error(errorMsg || "Failed to save book");
    }

    closeModal(elements.bookFormModal);
    showToast(isEditing ? "Book updated successfully!" : "New book added to catalog!", "success");
    await loadData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// ==========================================
// Delete Handling
// ==========================================
function openDeleteModal(bookId, title) {
  state.activeBookForAction = { _id: bookId, title };
  elements.deleteBookTitle.textContent = `"${title}"`;
  openModal(elements.deleteConfirmModal);
}

async function handleConfirmDelete() {
  if (!state.activeBookForAction?._id) return;

  const bookId = state.activeBookForAction._id;
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to delete book");
    }

    closeModal(elements.deleteConfirmModal);
    showToast("Book deleted successfully", "success");
    await loadData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// ==========================================
// Helper UI Functions
// ==========================================
function openModal(modalEl) {
  modalEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.remove("active");
  document.body.style.overflow = "auto";
}

function updateActiveFilterUI() {
  if (state.currentCategory && state.currentCategory !== "All") {
    elements.activeFilterBadge.style.display = "inline-flex";
    elements.badgeCategoryText.textContent = state.currentCategory;
  } else {
    elements.activeFilterBadge.style.display = "none";
  }
}

function resetCategoryFilter() {
  state.currentCategory = "All";
  document.querySelectorAll(".pill-btn").forEach((p) => {
    p.classList.toggle("active", p.dataset.category === "All");
  });
  updateActiveFilterUI();
  loadBooks();
}

function resetAllFilters() {
  elements.searchInput.value = "";
  elements.clearSearchBtn.style.display = "none";
  state.searchQuery = "";
  elements.sortBySelect.value = "newest";
  state.sortBy = "newest";
  resetCategoryFilter();
}

function toggleApiDocsSection() {
  const isHidden = elements.apiDocsBody.style.display === "none";
  elements.apiDocsBody.style.display = isHidden ? "block" : "none";
  elements.apiToggleText.textContent = isHidden ? "Hide API Details" : "Show API Details";
  elements.apiToggleIcon.className = isHidden ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icon =
    type === "success"
      ? "fa-circle-check"
      : type === "error"
      ? "fa-circle-exclamation"
      : "fa-circle-info";

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <div>${escapeHTML(message)}</div>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
