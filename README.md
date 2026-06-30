# ViewPort — Discover Movies

A modern, responsive movie search application that lets you explore thousands of films using the OMDB API. Search for movies, view detailed information, and keep track of your search history — all in a clean, cinematic interface.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## Features

- **Movie Search** — Search the OMDB database by title with real-time results
- **Detailed Movie Cards** — View poster, year, rating, and plot summary for each result
- **Pagination** — Navigate through large result sets with Previous / Next controls
- **Search History** — Quickly re-run recent searches from a persistent history bar
- **Featured Carousel** — Auto-rotating hero carousel showcasing popular movies
- **Responsive Design** — Fully fluid layout that works on mobile, tablet, and desktop
- **Dark / Light Theme** — Toggle between cinematic dark mode and clean light mode
- **Accessible UI** — Semantic HTML, ARIA labels, and keyboard-friendly navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (Custom properties, Flexbox, Grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Data Source | [OMDB API](http://www.omdbapi.com/) |
| Dev Server | `serve` (via npm) |

---

## Project Structure

```
viewport-movie-app/
├── index.html              # Homepage with search & carousel
├── about.html              # About page
├── articles.html           # Articles / blog page
├── contact.html            # Contact page
├── config.js               # ⚠️  API config (gitignored — see below)
├── script.js               # Bundled / legacy entry point
├── styles.css              # Bundled stylesheet
├── package.json            # Project metadata & scripts
├── .gitignore              # Git ignore rules
│
├── src/                    # Source files
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── api.js          # OMDB API wrapper
│   │   ├── config.js       # ⚠️  API config (gitignored — see below)
│   │   └── ui.js           # DOM manipulation & rendering
│   ├── styles/
│   │   ├── base.css        # Reset & typography
│   │   ├── components.css  # Buttons, cards, forms
│   │   ├── layout.css      # Grid, header, footer
│   │   └── main.css        # Imports
│   ├── pages/              # Page-specific HTML
│   └── components/         # Reusable HTML fragments
│
└── assets/                 # Images, fonts, icons
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- An [OMDB API key](http://www.omdbapi.com/apikey.aspx) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/viewport-movie-app.git
cd viewport-movie-app

# Install dependencies
npm install
```

### Configuration

> **Important:** Never commit your real API key to version control.

1. Copy the example config (or create your own):
   ```bash
   cp config.js config.local.js   # or edit config.js directly
   ```
2. Replace `'demo'` with your actual OMDB API key:
   ```js
   const CONFIG = {
       API_KEY: 'your-real-api-key-here',
       API_URL: 'https://www.omdbapi.com/'
   };
   ```
3. Ensure `config.js` (or any file containing the real key) is listed in `.gitignore`.

### Development

```bash
# Start local dev server (serves the src/ directory)
npm run dev

# Build CSS (concatenate source styles)
npm run build:css

# Preview production build
npm run build && npm run preview
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local dev server on `src/` |
| `npm run build` | Build CSS + JS for production |
| `npm run build:css` | Concatenate source CSS into `dist/styles.css` |
| `npm run build:js` | Placeholder — ES modules used directly |
| `npm run preview` | Serve the `dist/` folder for preview |

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [OMDB API](http://www.omdbapi.com/) for providing the movie data
- Built with ❤️ using vanilla web technologies
