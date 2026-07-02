/**
 * ViewPort News Module
 * Handles news rendering and display
 */

import { fetchMovieNews, clearNewsCache, formatRelativeTime } from './api.js';

// ============================================
// DOM REFERENCES
// ============================================
const dom = {
  newsContainer: document.getElementById('news-container'),
  newsLoading: document.getElementById('news-loading'),
  newsError: document.getElementById('news-error'),
  newsErrorText: document.getElementById('news-error-text'),
  refreshBtn: document.getElementById('news-refresh-btn'),
  categoryFilter: document.getElementById('news-category-filter'),
};

// ============================================
// STATE
// ============================================
const state = {
  currentCategory: 'entertainment',
  currentPage: 1,
  isLoading: false,
  articles: [],
};

// ============================================
// UTILITIES
// ============================================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function truncateText(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// ============================================
// NEWS CARD RENDERING
// ============================================
export function createNewsCard(article, index) {
  const imageHtml = article.urlToImage
    ? `<img class="news-image" src="${escapeHtml(article.urlToImage)}" alt="${escapeHtml(article.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`
    : '';

  const placeholderHtml = `<div class="news-image-placeholder" style="display:${article.urlToImage ? 'none' : 'flex'}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <line x1="17" y1="2" x2="17" y2="22"></line>
      <line x1="7" y1="2" x2="7" y2="22"></line>
    </svg>
  </div>`;

  const timeAgo = formatRelativeTime(article.publishedAt);

  return `
    <article class="news-card" style="animation-delay: ${index * 0.05}s">
      <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer" class="news-card-link">
        <div class="news-image-wrapper">
          ${imageHtml}
          ${placeholderHtml}
        </div>
        <div class="news-body">
          <div class="news-meta">
            <span class="news-source">${escapeHtml(article.source)}</span>
            <span class="news-time">${timeAgo}</span>
          </div>
          <h3 class="news-title">${escapeHtml(article.title)}</h3>
          <p class="news-excerpt">${escapeHtml(truncateText(article.description, 120))}</p>
          <span class="news-read-more">
            Read Full Article
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </div>
      </a>
    </article>
  `;
}

export function renderNews(articles) {
  if (!dom.newsContainer) return;

  if (!articles || articles.length === 0) {
    dom.newsContainer.innerHTML = `
      <div class="news-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12" y2="16"></line>
        </svg>
        <p>No news articles available at the moment. Check back later!</p>
      </div>
    `;
    return;
  }

  dom.newsContainer.innerHTML = articles
    .map((article, index) => createNewsCard(article, index))
    .join('');
}

// ============================================
// LOADING & ERROR STATES
// ============================================
export function showNewsLoading() {
  state.isLoading = true;
  if (dom.newsLoading) dom.newsLoading.classList.add('visible');
  if (dom.newsError) dom.newsError.classList.remove('visible');
  if (dom.newsContainer) dom.newsContainer.style.display = 'none';
  if (dom.refreshBtn) dom.refreshBtn.disabled = true;
}

export function hideNewsLoading() {
  state.isLoading = false;
  if (dom.newsLoading) dom.newsLoading.classList.remove('visible');
  if (dom.newsContainer) dom.newsContainer.style.display = 'grid';
  if (dom.refreshBtn) dom.refreshBtn.disabled = false;
}

export function showNewsError(message) {
  hideNewsLoading();
  if (dom.newsError) {
    dom.newsError.classList.add('visible');
    dom.newsErrorText.textContent = message;
  }
  if (dom.newsContainer) dom.newsContainer.style.display = 'none';
}

export function hideNewsError() {
  if (dom.newsError) dom.newsError.classList.remove('visible');
  if (dom.newsContainer) dom.newsContainer.style.display = 'grid';
}

// ============================================
// NEWS FETCHING
// ============================================
export async function loadNews(options = {}) {
  if (state.isLoading) return;

  showNewsLoading();
  hideNewsError();

  try {
    const data = await fetchMovieNews({
      category: state.currentCategory,
      page: state.currentPage,
      pageSize: 12,
      ...options
    });

    hideNewsLoading();
    state.articles = data.articles || [];
    renderNews(state.articles);
  } catch (error) {
    console.error('Failed to load news:', error);
    showNewsError('Unable to load news. Please check your connection and try again.');
  }
}

export async function refreshNews() {
  clearNewsCache();
  state.currentPage = 1;
  await loadNews();
}

// ============================================
// CATEGORY FILTERING
// ============================================
export function initCategoryFilter() {
  if (!dom.categoryFilter) return;

  dom.categoryFilter.addEventListener('change', (e) => {
    state.currentCategory = e.target.value;
    state.currentPage = 1;
    loadNews();
  });
}

// ============================================
// EVENT LISTENERS
// ============================================
export function bindNewsEvents() {
  // Refresh button
  if (dom.refreshBtn) {
    dom.refreshBtn.addEventListener('click', refreshNews);
  }

  // Category filter
  initCategoryFilter();
}

// ============================================
// INIT
// ============================================
export function initNews() {
  bindNewsEvents();
  loadNews();
}

// Expose to window for inline event handlers
if (typeof window !== 'undefined') {
  window.newsApp = {
    refreshNews,
    loadNews,
    initNews
  };
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNews);
} else {
  initNews();
}
