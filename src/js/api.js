/**
 * ViewPort API Module
 * Handles all external API communication
 */

const CONFIG = {
  API_URL: 'https://www.omdbapi.com/',
  API_KEY: 'demo'
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
