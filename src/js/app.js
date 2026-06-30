/* ViewPort — Main Application Script */

(function () {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  const CONFIG = {
    API_URL: 'https://www.omdbapi.com/',
    API_KEY: 'YOUR_OMDB_API_KEY', // Replace with your actual key
    CAROUSEL_ITEMS: 6,
    RESULTS_PER_PAGE: 10,
    HISTORY_KEY: 'viewport_search_history',
    MAX_HISTORY: 8,
  };

  // ============================================
  // STATE
  // ============================================
  const state = {
    currentQuery: '',
    currentPage: 1,
    totalResults: 0,
    carouselItems: [],
    carouselIndex: 0,
    carouselTimer: null,
    lastScrollY: 0,
  };

  // ============================================
  // DOM REFS
  // ============================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    searchForm: $('#search-form'),
    searchInput: $('#search-input'),
    loadingSection: $('#loading-section'),
    errorSection: $('#error-section'),
    errorText: $('#error-text'),
    resultsSection: $('#results-section'),
    moviesContainer: $('#movies-container'),
    pagination: $('#pagination'),
    pageInfo: $('#page-info'),
    prevBtn: $('#prev-btn'),
    nextBtn: $('#next-btn'),
    searchHistory: $('#search-history'),
    historyTags: $('#history-tags'),
    carouselTrack: $('#carousel-track'),
    carouselDots: $('#carousel-dots'),
    carouselPrev: $('#carousel-prev'),
    carouselNext: $('#carousel-next'),
    siteHeader: $('.site-header'),
    navToggle: $('#nav-toggle'),
    navLinks: $('.nav-links'),
  };

  // ============================================
  // UTILITIES
  // ============================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ============================================
  // SEARCH HISTORY
  // ============================================
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveToHistory(query) {
    const history = getHistory().filter((q) => q !== query);
    history.unshift(query);
    const trimmed = history.slice(0, CONFIG.MAX_HISTORY);
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(trimmed));
  }

  function renderHistory() {
    const history = getHistory();
    if (!dom.historyTags || !dom.searchHistory) return;

    if (history.length === 0) {
      dom.searchHistory.style.display = 'none';
      return;
    }

    dom.searchHistory.style.display = 'block';
    dom.historyTags.innerHTML = history
      .map(
        (q) =>
          `<button class="history-tag" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>`
      )
      .join('');
  }

  // ============================================
  // API
  // ============================================
  async function fetchMovies(query, page = 1) {
    const url = `${CONFIG.API_URL}?apikey=${CONFIG.API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=movie`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // ============================================
  // RENDER MOVIES
  // ============================================
  function renderMovies(data) {
    if (!dom.moviesContainer) return;

    if (data.Response !== 'True') {
      dom.moviesContainer.innerHTML = '';
      showError(data.Error || 'No movies found.');
      return;
    }

    hideError();
    state.totalResults = parseInt(data.totalResults, 10) || 0;

    const movies = data.Search || [];
    dom.moviesContainer.innerHTML = movies
      .map(
        (movie) => {
          const poster = movie.Poster && movie.Poster !== 'N/A'
            ? `<img class="movie-poster" src="${escapeHtml(movie.Poster)}" alt="${escapeHtml(movie.Title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`
            : '';
          const placeholder = `<div class="movie-poster-placeholder" style="display:${movie.Poster && movie.Poster !== 'N/A' ? 'none' : 'flex'}">No Poster</div>`;

          return `
            <article class="movie-card">
              ${poster}
              ${placeholder}
              <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(movie.Title)}</h3>
                <div class="movie-meta">
                  <span class="movie-year">${escapeHtml(movie.Year)}</span>
                  <span class="movie-type">${escapeHtml(movie.Type)}</span>
                </div>
                <a class="movie-link" href="https://www.imdb.com/title/${escapeHtml(movie.imdbID)}" target="_blank" rel="noopener">
                  View on IMDb
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </article>
          `;
        }
      )
      .join('');

    renderPagination();
  }

  // ============================================
  // PAGINATION
  // ============================================
  function renderPagination() {
    if (!dom.pagination) return;

    const totalPages = Math.ceil(state.totalResults / CONFIG.RESULTS_PER_PAGE);
    if (totalPages <= 1) {
      dom.pagination.innerHTML = '';
      return;
    }

    dom.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
    dom.prevBtn.disabled = state.currentPage <= 1;
    dom.nextBtn.disabled = state.currentPage >= totalPages;
  }

  // ============================================
  // LOADING / ERROR
  // ============================================
  function showLoading() {
    if (dom.loadingSection) dom.loadingSection.classList.add('visible');
    if (dom.errorSection) dom.errorSection.classList.remove('visible');
    if (dom.resultsSection) dom.resultsSection.style.display = 'none';
  }

  function hideLoading() {
    if (dom.loadingSection) dom.loadingSection.classList.remove('visible');
    if (dom.resultsSection) dom.resultsSection.style.display = 'block';
  }

  function showError(msg) {
    if (dom.errorSection) {
      dom.errorSection.classList.add('visible');
      dom.errorText.textContent = msg;
    }
    if (dom.resultsSection) dom.resultsSection.style.display = 'none';
  }

  function hideError() {
    if (dom.errorSection) dom.errorSection.classList.remove('visible');
  }

  // ============================================
  // SEARCH
  // ============================================
  async function performSearch(query, page = 1) {
    if (!query.trim()) return;

    state.currentQuery = query.trim();
    state.currentPage = page;

    showLoading();
    hideError();

    try {
      const data = await fetchMovies(state.currentQuery, page);
      hideLoading();
      renderMovies(data);
      saveToHistory(state.currentQuery);
      renderHistory();
    } catch (err) {
      hideLoading();
      showError('Something went wrong. Please try again.');
      console.error(err);
    }
  }

  // ============================================
  // CAROUSEL
  // ============================================
  function initCarousel() {
    fetch(`${CONFIG.API_URL}?apikey=${CONFIG.API_KEY}&s=popular&page=1&type=movie`)
      .then((res) => res.json())
      .then((data) => {
        if (data.Response === 'True') {
          state.carouselItems = data.Search.slice(0, CONFIG.CAROUSEL_ITEMS);
          renderCarousel();
          startCarouselAutoplay();
        }
      })
      .catch((err) => console.warn('Carousel load failed:', err));
  }

  function renderCarousel() {
    if (!dom.carouselTrack || !dom.carouselDots) return;

    dom.carouselTrack.innerHTML = state.carouselItems
      .map(
        (movie, i) => `
        <div class="carousel-slide ${i === 0 ? 'active' : ''}" 
             style="background-image: url('${escapeHtml(movie.Poster)}');"
             role="img" aria-label="${escapeHtml(movie.Title)}">
          <div class="carousel-caption">
            <h3>${escapeHtml(movie.Title)}</h3>
            <p>${escapeHtml(movie.Year)} · ${escapeHtml(movie.Type)}</p>
          </div>
        </div>
      `
      )
      .join('');

    dom.carouselDots.innerHTML = state.carouselItems
      .map(
        (_, i) => `
        <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
      `
      )
      .join('');

    // Dot click handlers
    dom.carouselDots.querySelectorAll('.carousel-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.index, 10));
        resetCarouselAutoplay();
      });
    });
  }

  function goToSlide(index) {
    const slides = dom.carouselTrack.querySelectorAll('.carousel-slide');
    const dots = dom.carouselDots.querySelectorAll('.carousel-dot');
    if (!slides.length) return;

    slides[state.carouselIndex]?.classList.remove('active');
    dots[state.carouselIndex]?.classList.remove('active');

    state.carouselIndex = (index + slides.length) % slides.length;

    slides[state.carouselIndex]?.classList.add('active');
    dots[state.carouselIndex]?.classList.add('active');
  }

  function nextSlide() {
    goToSlide(state.carouselIndex + 1);
  }

  function prevSlide() {
    goToSlide(state.carouselIndex - 1);
  }

  function startCarouselAutoplay() {
    stopCarouselAutoplay();
    state.carouselTimer = setInterval(nextSlide, 5000);
  }

  function stopCarouselAutoplay() {
    if (state.carouselTimer) {
      clearInterval(state.carouselTimer);
      state.carouselTimer = null;
    }
  }

  function resetCarouselAutoplay() {
    stopCarouselAutoplay();
    startCarouselAutoplay();
  }

  // ============================================
  // NAVBAR SCROLL HIDE/SHOW
  // ============================================
  function initNavbarScroll() {
    if (!dom.siteHeader) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY && currentScrollY > 120) {
            // Scrolling down — hide navbar
            dom.siteHeader.classList.add('hidden');
          } else {
            // Scrolling up — show navbar
            dom.siteHeader.classList.remove('hidden');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ============================================
  // MOBILE NAV TOGGLE
  // ============================================
  function initMobileNav() {
    if (!dom.navToggle || !dom.navLinks) return;

    dom.navToggle.addEventListener('click', () => {
      dom.navLinks.classList.toggle('open');
    });

    // Close on link click
    dom.navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        dom.navLinks.classList.remove('open');
      });
    });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function bindEvents() {
    // Search form
    if (dom.searchForm) {
      dom.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = dom.searchInput?.value || '';
        if (query.trim()) {
          performSearch(query, 1);
          dom.searchInput?.blur();
        }
      });
    }

    // History tag clicks
    if (dom.historyTags) {
      dom.historyTags.addEventListener('click', (e) => {
        const tag = e.target.closest('.history-tag');
        if (tag && dom.searchInput) {
          const query = tag.dataset.query;
          dom.searchInput.value = query;
          performSearch(query, 1);
        }
      });
    }

    // Pagination
    if (dom.prevBtn) {
      dom.prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
          performSearch(state.currentQuery, state.currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (dom.nextBtn) {
      dom.nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(state.totalResults / CONFIG.RESULTS_PER_PAGE);
        if (state.currentPage < totalPages) {
          performSearch(state.currentQuery, state.currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Carousel buttons
    if (dom.carouselPrev) {
      dom.carouselPrev.addEventListener('click', () => {
        prevSlide();
        resetCarouselAutoplay();
      });
    }

    if (dom.carouselNext) {
      dom.carouselNext.addEventListener('click', () => {
        nextSlide();
        resetCarouselAutoplay();
      });
    }

    // Pause carousel on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopCarouselAutoplay);
      carousel.addEventListener('mouseleave', startCarouselAutoplay);
    }
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    renderHistory();
    initCarousel();
    initNavbarScroll();
    initMobileNav();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
