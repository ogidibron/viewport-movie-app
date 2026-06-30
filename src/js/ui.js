/**
 * ViewPort UI Module
 * Handles all UI rendering and DOM manipulation
 */

// ============================================
// DOM REFERENCES
// ============================================
const dom = {
  moviesContainer: document.getElementById('movies-container'),
  loadingSection: document.getElementById('loading-section'),
  errorSection: document.getElementById('error-section'),
  errorText: document.getElementById('error-text'),
  searchHistory: document.getElementById('search-history'),
  pagination: document.getElementById('pagination'),
  navToggle: document.querySelector('.nav-toggle'),
  navLinks: document.querySelector('.nav-links')
};

// ============================================
// MOVIE CARD RENDERING
// ============================================
export function createMovieCard(movie) {
  const poster = movie.Poster && movie.Poster !== 'N/A'
    ? movie.Poster
    : '';

  const posterHtml = poster
    ? `<img src="${poster}" alt="${escapeHtml(movie.Title)} poster" class="movie-poster" loading="lazy">`
    : `<div class="movie-poster-placeholder">No Image Available</div>`;

  return `
    <article class="movie-card">
      ${posterHtml}
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(movie.Title)}</h3>
        <div class="movie-meta">
          <span class="movie-year">${escapeHtml(movie.Year)}</span>
          <span class="movie-type">${escapeHtml(movie.Type)}</span>
        </div>
        <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank" rel="noopener noreferrer" class="movie-link">
          View on IMDB
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </article>
  `;
}

export function displayMovies(movies) {
  if (!dom.moviesContainer) return;
  dom.moviesContainer.innerHTML = movies.map(createMovieCard).join('');
}

// ============================================
// LOADING & ERROR STATES
// ============================================
export function showLoading() {
  if (dom.loadingSection) dom.loadingSection.classList.add('visible');
  if (dom.errorSection) dom.errorSection.classList.remove('visible');
}

export function hideLoading() {
  if (dom.loadingSection) dom.loadingSection.classList.remove('visible');
}

export function showError(message) {
  hideLoading();
  if (dom.errorText) dom.errorText.textContent = message;
  if (dom.errorSection) dom.errorSection.classList.add('visible');
}

// ============================================
// SEARCH HISTORY
// ============================================
export function renderSearchHistory() {
  if (!dom.searchHistory) return;

  try {
    const data = localStorage.getItem('viewport_search_history');
    const history = data ? JSON.parse(data) : [];
  } catch {
    // Storage unavailable
  }

  // History rendering is handled in app.js via direct DOM access
  // This module focuses on pure UI rendering helpers
}

// ============================================
// PAGINATION
// ============================================
export function renderPagination(currentPage, totalPages) {
  if (!dom.pagination || totalPages <= 1) {
    if (dom.pagination) dom.pagination.innerHTML = '';
    return;
  }

  dom.pagination.innerHTML = `
    <div class="pagination">
      <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">Previous</button>
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">Next</button>
    </div>
  `;

  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  if (prevBtn && !prevBtn.disabled) {
    prevBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('viewport:pageChange', {
        detail: { page: currentPage - 1 }
      }));
    });
  }
  if (nextBtn && !nextBtn.disabled) {
    nextBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('viewport:pageChange', {
        detail: { page: currentPage + 1 }
      }));
    });
  }
}

// ============================================
// NAVIGATION
// ============================================
export function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `${page}.html`) {
      link.classList.add('active');
    }
  });
}

export function toggleMobileNav() {
  if (dom.navLinks) {
    dom.navLinks.classList.toggle('open');
  }
  if (dom.navToggle) {
    const isOpen = dom.navLinks?.classList.contains('open') || false;
    dom.navToggle.setAttribute('aria-expanded', isOpen);
  }
}

export function initMobileNav() {
  if (dom.navToggle) {
    dom.navToggle.addEventListener('click', toggleMobileNav);
  }

  // Close menu when a link is clicked
  if (dom.navLinks) {
    dom.navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        dom.navLinks.classList.remove('open');
        if (dom.navToggle) dom.navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// ============================================
// UTILITIES
// ============================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
