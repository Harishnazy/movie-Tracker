// Movie storage (In a real environment, this would use localStorage)
let movies = [];
let editingIndex = -1;

// DOM Elements
const form = document.getElementById("movie-form");
const alertContainer = document.getElementById("alert-container");
const moviesContainer = document.getElementById("movies-container");
const emptyState = document.getElementById("empty-state");
const formTitle = document.getElementById("form-title");
const submitText = document.getElementById("submit-text");
const cancelBtn = document.getElementById("cancel-edit-btn");

// Form elements
const imageInput = document.getElementById("movie-image");
const titleInput = document.getElementById("movie-title");
const seasonInput = document.getElementById("movie-season");
const episodeInput = document.getElementById("movie-episode");
const statusInput = document.getElementById("movie-status");
const genreInput = document.getElementById("movie-genre");

// Statistics elements
const totalMoviesEl = document.getElementById("total-movies");
const watchingCountEl = document.getElementById("watching-count");
const completedCountEl = document.getElementById("completed-count");
const onHoldCountEl = document.getElementById("on-hold-count");

/**
 * Initialize the application
 */
function init() {
  // In a real environment, load from localStorage here
  // movies = JSON.parse(localStorage.getItem('movies') || '[]');
  renderMovies();
  updateStatistics();
}

/**
 * Save movies to storage
 */
function saveMovies() {
  // In a real environment, save to localStorage here
  // localStorage.setItem('movies', JSON.stringify(movies));
}

/**
 * Show alert message
 */
function showAlert(message, type = "error") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
                <span>${type === "error" ? "⚠️" : "✅"}</span>
                <span>${message}</span>
            `;

  alertContainer.innerHTML = "";
  alertContainer.appendChild(alertDiv);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertDiv.style.opacity = "0";
    setTimeout(() => alertDiv.remove(), 300);
  }, 5000);
}

/**
 * Clear form inputs
 */
function clearForm() {
  form.reset();
  editingIndex = -1;
  formTitle.textContent = "Add New Movie";
  submitText.textContent = "Add Movie";
  cancelBtn.style.display = "none";
  document.getElementById("form-submit-btn").innerHTML =
    "<span>➕</span><span>Add Movie</span>";
}

/**
 * Validate form inputs
 */
function validateForm() {
  const title = titleInput.value.trim();
  const status = statusInput.value;
  const genre = genreInput.value;

  if (!title) {
    showAlert("Please enter a movie title");
    titleInput.focus();
    return false;
  }

  if (!status) {
    showAlert("Please select a status");
    statusInput.focus();
    return false;
  }

  if (!genre) {
    showAlert("Please select a genre");
    genreInput.focus();
    return false;
  }

  // Check for duplicate titles (only when adding, not editing)
  if (
    editingIndex === -1 &&
    movies.some((movie) => movie.title.toLowerCase() === title.toLowerCase())
  ) {
    showAlert("A movie with this title already exists in your watchlist");
    titleInput.focus();
    return false;
  }

  return true;
}

/**
 * Add or update a movie
 */
function addOrUpdateMovie(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const movieData = {
    id: editingIndex !== -1 ? movies[editingIndex].id : Date.now(),
    image: imageInput.value.trim() || null,
    title: titleInput.value.trim(),
    season: seasonInput.value || null,
    episode: episodeInput.value || null,
    status: statusInput.value,
    genre: genreInput.value,
    dateAdded:
      editingIndex !== -1
        ? movies[editingIndex].dateAdded
        : new Date().toISOString(),
  };

  if (editingIndex !== -1) {
    // Update existing movie
    movies[editingIndex] = movieData;
    showAlert("Movie updated successfully!", "success");
  } else {
    // Add new movie
    movies.push(movieData);
    showAlert("Movie added to your watchlist!", "success");
  }

  saveMovies();
  renderMovies();
  updateStatistics();
  clearForm();
}

/**
 * Remove a movie from the watchlist
 */
function removeMovie(index) {
  if (
    confirm("Are you sure you want to remove this movie from your watchlist?")
  ) {
    const removedMovie = movies[index];
    movies.splice(index, 1);

    saveMovies();
    renderMovies();
    updateStatistics();

    showAlert(
      `"${removedMovie.title}" has been removed from your watchlist`,
      "success"
    );

    // If we were editing this movie, clear the form
    if (editingIndex === index) {
      clearForm();
    }
  }
}

/**
 * Edit a movie
 */
function editMovie(index) {
  const movie = movies[index];

  // Populate form with movie data
  imageInput.value = movie.image || "";
  titleInput.value = movie.title;
  seasonInput.value = movie.season || "";
  episodeInput.value = movie.episode || "";
  statusInput.value = movie.status;
  genreInput.value = movie.genre;

  // Update form UI
  editingIndex = index;
  formTitle.textContent = "Edit Movie";
  submitText.textContent = "Update Movie";
  cancelBtn.style.display = "inline-flex";
  document.getElementById("form-submit-btn").innerHTML =
    "<span>✏️</span><span>Update Movie</span>";

  // Scroll to form
  document
    .querySelector(".form-section")
    .scrollIntoView({ behavior: "smooth" });

  showAlert(
    "Editing mode activated. Make your changes and click Update Movie.",
    "success"
  );
}

/**
 * Cancel editing mode
 */
function cancelEdit() {
  clearForm();
  showAlert("Edit mode cancelled", "success");
}

/**
 * Create movie card HTML
 */
function createMovieCard(movie, index) {
  const imageHtml = movie.image
    ? `<img src="${movie.image}" alt="${movie.title}" onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=&quot;display:flex;align-items:center;justify-content:center;height:100%;background:#f1f2f6;color:#7f8c8d;font-size:14px;&quot;>No Image Available</div>';" />`
    : '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f1f2f6;color:#7f8c8d;font-size:14px;">No Image Available</div>';

  return `
                <div class="movie-card">
                    <div class="movie-image">
                        ${imageHtml}
                    </div>
                    <div class="movie-details">
                        <h3>${movie.title}</h3>
                        <div class="movie-meta">
                            ${
                              movie.season
                                ? `<div class="meta-item"><span class="meta-label">Season:</span><span class="meta-value">${movie.season}</span></div>`
                                : ""
                            }
                            ${
                              movie.episode
                                ? `<div class="meta-item"><span class="meta-label">Episode:</span><span class="meta-value">${movie.episode}</span></div>`
                                : ""
                            }
                            <div class="meta-item"><span class="meta-label">Status:</span><span class="meta-value status-badge status-${
                              movie.status
                            }">${movie.status.replace("-", " ")}</span></div>
                            <div class="meta-item"><span class="meta-label">Genre:</span><span class="meta-value genre-badge">${
                              movie.genre
                            }</span></div>
                        </div>
                        <div class="movie-actions">
                            <button class="btn btn-success" onclick="editMovie(${index})">
                                <span>✏️</span>
                                Edit
                            </button>
                            <button class="btn btn-danger" onclick="removeMovie(${index})">
                                <span>🗑️</span>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render all movies
 */
function renderMovies() {
  if (movies.length === 0) {
    moviesContainer.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <h3>No movies in your watchlist yet</h3>
                        <p>Add your first movie above to get started!</p>
                    </div>
                `;
  } else {
    const moviesGrid = document.createElement("div");
    moviesGrid.className = "movie-grid";
    moviesGrid.innerHTML = movies
      .map((movie, index) => createMovieCard(movie, index))
      .join("");
    moviesContainer.innerHTML = "";
    moviesContainer.appendChild(moviesGrid);
  }
}

/**
 * Update statistics
 */
function updateStatistics() {
  const total = movies.length;
  const watching = movies.filter((m) => m.status === "watching").length;
  const completed = movies.filter((m) => m.status === "completed").length;
  const onHold = movies.filter((m) => m.status === "on-hold").length;

  // Animate count updates
  animateCount(totalMoviesEl, total);
  animateCount(watchingCountEl, watching);
  animateCount(completedCountEl, completed);
  animateCount(onHoldCountEl, onHold);
}

/**
 * Animate number counting
 */
function animateCount(element, target) {
  const current = parseInt(element.textContent) || 0;
  const increment = target > current ? 1 : -1;
  const timer = setInterval(() => {
    const value = parseInt(element.textContent);
    if (value === target) {
      clearInterval(timer);
    } else {
      element.textContent = value + increment;
    }
  }, 50);
}

// Event Listeners
form.addEventListener("submit", addOrUpdateMovie);
cancelBtn.addEventListener("click", cancelEdit);

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", init);

/**
 * Save movies to localStorage
 */
function saveMovies() {
  localStorage.setItem("movies", JSON.stringify(movies));
}

/**
 * Load movies from localStorage
 */
function loadMovies() {
  const stored = localStorage.getItem("movies");
  movies = stored ? JSON.parse(stored) : [];
}

// Update init to load from localStorage
function init() {
  loadMovies();
  renderMovies();
  updateStatistics();
}
