# ViewPort - Movie Search Application Architecture

## Project Overview

ViewPort is a movie search application that uses the OMDB API to fetch and display movie information. The application allows users to search for movies and view their posters, titles, years, and types.

## Current State Analysis

### Existing Files
- `index.html` - Main page with search functionality
- `about.html` - About page
- `contact.html` - Contact page with inline JavaScript
- `script.js` - Main JavaScript (not modular, uses hardcoded API key)
- `styles.css` - All styles in one file
- `config.js` - Configuration file (exists but not used)

### Issues Identified
1. Flat file structure - no organization
2. `config.js` not integrated into the application
3. Code duplication across HTML files (nav, footer)
4. Inline JavaScript in contact.html
5. No build process or development workflow
6. Missing loading spinner animation
7. No mobile navigation menu

## Proposed Architecture

```
viewport-app/
├── src/
│   ├── pages/
│   │   ├── index.html
│   │   ├── about.html
│   │   └── contact.html
│   ├── components/
│   │   ├── header.html
│   │   └── footer.html
│   ├── js/
│   │   ├── api.js           # API service module
│   │   ├── ui.js            # UI rendering module
│   │   ├── config.js        # Configuration module
│   │   └── app.js           # Main application entry
│   └── styles/
│       ├── base.css         # Reset, variables, base styles
│       ├── components.css     # Component-specific styles
│       ├── layout.css         # Layout styles
│       └── main.css           # Main entry point (imports all)
├── assets/
│   └── favicon.ico
├── dist/                    # Built/optimized files
├── package.json
├── README.md
└── .gitignore
```

## Module Structure

### 1. config.js
```javascript
// Configuration module
export const CONFIG = {
    API_KEY: 'demo',
    API_URL: 'https://www.omdbapi.com/'
};
```

### 2. api.js
```javascript
// API service module
import { CONFIG } from './config.js';

export async function searchMovies(query) {
    // Fetch movies from OMDB API
}

export async function getMovieDetails(id) {
    // Fetch single movie details
}
```

### 3. ui.js
```javascript
// UI rendering module
export function createMovieCard(movie) {
    // Create movie card HTML
}

export function showLoading() {
    // Show loading state
}

export function showError(message) {
    // Show error message
}

export function displayMovies(movies) {
    // Display movies in container
}
```

### 4. app.js
```javascript
// Main application entry
import { searchMovies } from './api.js';
import { showLoading, showError, displayMovies } from './ui.js';

// Initialize app and event listeners
```

## Features to Implement

### Phase 1: Structure & Organization
- [ ] Create proper directory structure
- [ ] Set up package.json with npm scripts
- [ ] Split CSS into modular files
- [ ] Create component templates

### Phase 2: JavaScript Modularization
- [ ] Convert to ES6 modules
- [ ] Integrate config.js properly
- [ ] Separate API and UI concerns
- [ ] Move inline contact script to main module

### Phase 3: Enhancements
- [ ] Add loading spinner animation
- [ ] Add mobile navigation menu
- [ ] Add form validation
- [ ] Add accessibility improvements

## Development Workflow

```json
{
  "scripts": {
    "dev": "serve src/",
    "build": "npm run build:css && npm run build:js",
    "build:css": "concat src/styles/*.css > dist/styles.css",
    "build:js": "rollup src/js/app.js --format es --file dist/script.js",
    "lint": "eslint src/js/",
    "test": "jest"
  }
}
```

## Design System

### Color Palette
- Primary: `#2c243b` (Deep Purple)
- Secondary: `#4a3f5c` (Muted Violet)
- Accent: `#c99e5d` (Antique Gold)
- Text: `#f0f0f0` (Soft White)
- Background: `#0d0a14` (Midnight Purple)
- Highlight: `#ff6b6b` (Coral)

### Typography
- Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Base font size: 16px
- Line height: 1.6

### Breakpoints
- Mobile: max-width 480px
- Tablet: max-width 768px
- Desktop: 1200px max-width

## Questions for Clarification

1. Do you want to use a build tool like Vite, Webpack, or just npm scripts?
2. Should we add TypeScript support?
3. Do you want to add unit tests for the JavaScript modules?
4. Should we implement local storage for search history?
5. Do you want to add pagination for search results?