/**
 * ViewPort Backend Proxy Server
 * Proxies requests to NewsAPI to avoid CORS issues and hide API keys
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock news data for development/demo
const MOCK_NEWS = [
  {
    title: "Marvel Studios Announces New Phase 6 Films at Comic-Con",
    description: "Kevin Feige reveals exciting new projects including a new Avengers movie and several solo character films coming to theaters.",
    url: "https://example.com/marvel-phase-6",
    urlToImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: "Variety",
    author: "Brent Lang"
  },
  {
    title: "Oscar Nominations 2026: Surprising Snubs and Shocking First-Timers",
    description: "The Academy Awards nominations are here, and several expected frontrunners were left out while newcomers dominated the list.",
    url: "https://example.com/oscar-nominations-2026",
    urlToImage: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: "The Hollywood Reporter",
    author: "Carolyn Giardina"
  },
  {
    title: "Christopher Nolan's Next Film Revealed: A Historical Epic Shot on IMAX 70mm",
    description: "The acclaimed director returns with an ambitious new project that promises to push cinematic boundaries once again.",
    url: "https://example.com/nolan-next-film",
    urlToImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede73ba?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: "IndieWire",
    author: "Eric Kohn"
  },
  {
    title: "Box Office Report: 'Dune: Part Three' Dominates with $180M Opening Weekend",
    description: "Denis Villeneuve's sci-fi epic continues its reign at the box office, setting new records for the franchise.",
    url: "https://example.com/dune-box-office",
    urlToImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: "Deadline",
    author: "Anthony D'Alessandro"
  },
  {
    title: "Timothée Chalamet to Play Bob Dylan in New Biopic Directed by James Mangold",
    description: "The Academy Award nominee takes on the iconic musician role in the highly anticipated biopic 'A Complete Unknown'.",
    url: "https://example.com/chalamet-dylan",
    urlToImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: "Variety",
    author: "Justin Kroll"
  },
  {
    title: "Netflix Invests $2 Billion in Original Film Production for 2026",
    description: "The streaming giant ramps up its movie slate with 50 new original films planned across all genres.",
    url: "https://example.com/netflix-2-billion",
    urlToImage: "https://images.unsplash.com/photo-1574375927938-5ff62d403f0b?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    source: "The Verge",
    author: "Julia Alexander"
  },
  {
    title: "Cannes Film Festival 2026: Full Lineup Announced with Strong Female Director Presence",
    description: "This year's Cannes lineup features a record number of female directors, including several debut filmmakers.",
    url: "https://example.com/cannes-2026-lineup",
    urlToImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    source: "Screen Daily",
    author: "Melanie Goodfellow"
  },
  {
    title: "Margot Robbie and Ryan Gosling to Reunite for 'Barbie' Sequel",
    description: "Warner Bros. confirms the beloved duo will return for another adventure in the Barbie universe.",
    url: "https://example.com/barbie-sequel",
    urlToImage: "https://images.unsplash.com/photo-1594909122849-11daa3e4d3a3?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    source: "Entertainment Weekly",
    author: "Lester Fabian Brathwaite"
  },
  {
    title: "AI in Film: How Studios Are Using Artificial Intelligence for Visual Effects",
    description: "From de-aging actors to creating entire digital environments, AI is revolutionizing how movies are made.",
    url: "https://example.com/ai-film-vfx",
    urlToImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    source: "Wired",
    author: "Will Knight"
  },
  {
    title: "Sundance 2026: 10 Films You Need to See This Year",
    description: "Our critics pick the most compelling independent films from this year's Sundance Film Festival.",
    url: "https://example.com/sundance-2026-picks",
    urlToImage: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    source: "IndieWire",
    author: "Eric Kohn"
  },
  {
    title: "The Evolution of Movie Theaters: From Multiplexes to Luxury Cinemas",
    description: "How theaters are adapting to compete with streaming by offering premium experiences that can't be matched at home.",
    url: "https://example.com/movie-theater-evolution",
    urlToImage: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    source: "The Atlantic",
    author: "David Sims"
  },
  {
    title: "Behind the Scenes: How 'Avatar 3' Is Pushing the Boundaries of Underwater Filming",
    description: "James Cameron's team developed new technology to capture stunning underwater performances for the latest Pandora adventure.",
    url: "https://example.com/avatar-3-underwater",
    urlToImage: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&h=400&fit=crop",
    publishedAt: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    source: "Empire",
    author: "Ben Travis"
  }
];

// NewsAPI proxy endpoint
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'entertainment', page = 1, pageSize = 12, query = '' } = req.query;

    // Return mock data if no API key or using demo key
    if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'demo' || process.env.NEWS_API_KEY === 'your_newsapi_key_here') {
      console.log('Returning mock news data (no valid NewsAPI key configured)');
      
      // Simulate filtering based on category
      let filtered = MOCK_NEWS;
      if (query) {
        const q = query.toLowerCase();
        filtered = MOCK_NEWS.filter(article =>
          article.title.toLowerCase().includes(q) ||
          article.description.toLowerCase().includes(q)
        );
      }

      // Paginate mock data
      const start = (parseInt(page) - 1) * parseInt(pageSize);
      const end = start + parseInt(pageSize);
      const paginated = filtered.slice(start, end);

      return res.json({
        articles: paginated,
        totalResults: filtered.length
      });
    }

    let url = `https://newsapi.org/v2/top-headlines?apiKey=${process.env.NEWS_API_KEY}&page=${page}&pageSize=${pageSize}`;

    if (query) {
      url = `https://newsapi.org/v2/everything?apiKey=${process.env.NEWS_API_KEY}&q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&sortBy=publishedAt`;
    } else {
      url += `&category=${category}`;
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ViewPort-Movie-App/1.0'
      }
    });

    // Filter for movie/entertainment relevant content
    const articles = (response.data.articles || []).filter(article => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      const content = (article.content || '').toLowerCase();

      // Keywords related to movies, actors, entertainment
      const movieKeywords = [
        'movie', 'film', 'actor', 'actress', 'director', 'cinema', 'hollywood',
        'premiere', 'box office', 'oscar', 'academy award', 'netflix', 'disney',
        'marvel', 'dc', 'sequel', 'franchise', 'casting', 'trailer', 'review',
        'celebrity', 'star', 'producer', 'screenwriter', 'studio', 'streaming'
      ];

      return movieKeywords.some(keyword =>
        title.includes(keyword) ||
        description.includes(keyword) ||
        content.includes(keyword)
      );
    });

    res.json({
      articles: articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Unknown',
        author: article.author
      })),
      totalResults: articles.length
    });

  } catch (error) {
    console.error('NewsAPI proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from src directory
app.use(express.static('src'));

// Serve root-level files (index.html, articles.html, etc.)
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`ViewPort server running on http://localhost:${PORT}`);
  console.log(`  - Frontend: http://localhost:${PORT}`);
  console.log(`  - API proxy: http://localhost:${PORT}/api/news`);
  console.log(`  - Health check: http://localhost:${PORT}/api/health`);
});
