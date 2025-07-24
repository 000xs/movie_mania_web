 
# 🎬 Movie Mania Web

A sleek, responsive web application for browsing, searching, and bookmarking your favorite movies and TV shows.  
Built with **React**, **TailwindCSS** and powered by the **TMDB API**.

---

## ✨ Features

- 🔍 **Instant search** with debounced input  
- 📚 **Category filters** (Now Playing, Top Rated, Upcoming, etc.)  
- ❤️ **Personal watchlist** stored in `localStorage`  
- 🌗 **Dark / Light mode** toggle  
- 📱 **100 % responsive** (mobile-first design)  
- ⚡ **Fast page loads** thanks to code-splitting & lazy images  

---

## 🚀 Quick Start

> ℹ️ You need Node ≥ 18 and a free TMDB API key.

1. **Clone the repo**
   ```bash
   git clone https://github.com/000xs/movie_mania_web.git
   cd movie_mania_web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment variables**  
   Create `.env` in the project root:
   ```dotenv
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will open at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Available Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start Vite dev server              |
| `npm run build`  | Build for production (`dist/`)     |
| `npm run preview`| Preview production build locally   |
| `npm run lint`   | Lint with ESLint + Prettier        |
| `npm run test`   | Run unit tests with Vitest         |

---

## 🗂️ Project Structure

```
movie_mania_web/
├── public/              # Static assets (favicon, robots.txt…)
├── src/
│   ├── api/             # TMDB service layer
│   ├── components/      # Reusable React components
│   ├── pages/           # Route-level page components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand global store
│   ├── styles/          # Tailwind entry & global styles
│   ├── utils/           # Helper utilities
│   └── main.jsx         # App bootstrap
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🛡️ Tech Stack

| Layer        | Technology               |
|--------------|--------------------------|
| UI Library   | React 18 + Vite          |
| Styling      | TailwindCSS + DaisyUI    |
| State Mgmt   | Zustand                  |
| Routing      | React-Router v6          |
| API          | TMDB REST API            |
| Testing      | Vitest + React-Testing-Library |
| Linting      | ESLint + Prettier        |

---

## 🧩 API Endpoints Used

- `/movie/popular` – Popular movies  
- `/search/movie`   – Search movies  
- `/movie/{id}`     – Movie details  
- `/genre/movie/list` – Available genres  

---

## 🤝 Contributing

1. Fork the repo  
2. Create your feature branch: `git checkout -b feat/amazing-feature`  
3. Commit your changes: `git commit -m 'Add amazing feature'`  
4. Push to the branch: `git push origin feat/amazing-feature`  
5. Open a Pull Request 🎉

---

## 📄 License

MIT © [000xs](https://github.com/000xs)

---

## 🙋‍♂️ Support

Open an [issue](https://github.com/000xs/movie_mania_web/issues) or reach out on [Twitter](https://twitter.com/000xs).
 