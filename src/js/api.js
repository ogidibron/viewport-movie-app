/**
 * ViewPort API Module
 * Handles all external API communication
 */

const CONFIG = {
  API_URL: 'https://www.omdbapi.com/',
  API_KEY: 'demo',
  PROXY_URL: 'http://localhost:3001/api',
  NEWS_CACHE_KEY: 'viewport_news_cache',
  NEWS_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
};

/**
 * Search for movies via OMDB API
 * @param {string} query - Search query
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} API response
 */
export async function searchMovies(query, page = 1) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set('apikey', CONFIG.API_KEY);
  url.searchParams.set('s', query);
  url.searchParams.set('page', page);
  url.searchParams.set('type', 'movie');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch movie news from the backend proxy
 * @param {Object} options - News options
 * @param {string} options.category - News category (entertainment, business, etc.)
 * @param {number} options.page - Page number
 * @param {number} options.pageSize - Number of articles per page
 * @param {string} options.query - Search query for specific topics
 * @returns {Promise<Object>} News data with articles array
 */
export async function fetchMovieNews(options = {}) {
  const {
    category = 'entertainment',
    page = 1,
    pageSize = 12,
    query = ''
  } = options;

  // Check cache first
  const cached = getCachedNews();
  if (cached && !query) {
    return cached;
  }

  try {
    const url = new URL(`${CONFIG.PROXY_URL}/news`);
    url.searchParams.set('category', category);
    url.searchParams.set('page', page);
    url.searchParams.set('pageSize', pageSize);
    if (query) url.searchParams.set('query', query);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the results (only for non-search queries)
    if (!query && data.articles) {
      cacheNews(data);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    // Return cached data if available, even if expired
    const expiredCache = getCachedNews(true);
    if (expiredCache) {
      return expiredCache;
    }
    throw error;
  }
}

/**
 * Get cached news data
 * @param {boolean} ignoreExpiry - Return cache even if expired
 * @returns {Object|null} Cached news data
 */
function getCachedNews(ignoreExpiry = false) {
  try {
    const cached = localStorage.getItem(CONFIG.NEWS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CONFIG.NEWS_CACHE_DURATION;

    if (isExpired && !ignoreExpiry) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Cache news data to localStorage
 * @param {Object} data - News data to cache
 */
function cacheNews(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CONFIG.NEWS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache news:', error);
  }
}

/**
 * Clear news cache
 */
export function clearNewsCache() {
  try {
    localStorage.removeItem(CONFIG.NEWS_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear news cache:', error);
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
