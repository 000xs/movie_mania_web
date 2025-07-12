const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL

// API request options with authorization
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

// Helper function to get full image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder.svg'
  return `${IMAGE_BASE_URL}/${size}${path}`
}

// Helper function to get backdrop image URL
export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/placeholder.svg'
  return `${IMAGE_BASE_URL}/${size}${path}`
}

// Get trending movies
export const getTrendingMovies = async () => {
  try {
    const response = await fetch(`/api/movies`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    return []
  }
}

// Get popular movies
export const getPopularMovies = async () => {
  try {
    const response = await fetch(`/api/movies?source=tmdb&category=popular`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return []
  }
}

// Get top rated movies
export const getTopRatedMovies = async () => {
  try {
    const response = await fetch(`/api/movies?source=tmdb&category=top_rated`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching top rated movies:', error)
    return []
  }
}

// Get upcoming movies
export const getUpcomingMovies = async () => {
  try {
    const response = await fetch(`/api/movies?source=tmdb&category=upcoming`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching upcoming movies:', error)
    return []
  }
}

// Get now playing movies
export const getNowPlayingMovies = async () => {
  try {
    const response = await fetch(`/api/movies?source=tmdb&category=now_playing`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching now playing movies:', error)
    return []
  }
}

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`/api/movies/${movieId}?source=tmdb`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching movie details:', error)
    return null
  }
}

// Get movie genres
export const getGenres = async () => {
  try {
    const response = await fetch(`/api/genres`)
    const data = await response.json()
    return data.genres
  } catch (error) {
    console.error('Error fetching genres:', error)
    return []
  }
}

// Search movies
export const searchMovies = async (query) => {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error searching movies:', error)
    return []
  }
}

// TV SERIES FUNCTIONS

// Get trending TV series
export const getTrendingTvSeries = async () => {
  try {
    const response = await fetch(`/api/tv`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching trending TV series:', error)
    return []
  }
}

// Get popular TV series
export const getPopularTVSeries = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching popular TV series:', error)
    return []
  }
}

// Get top rated TV series
export const getTopRatedTVSeries = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tv/top_rated`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching top rated TV series:', error)
    return []
  }
}

// Get airing today TV series
export const getAiringTodayTVSeries = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tv/airing_today`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching airing today TV series:', error)
    return []
  }
}

// Get on the air TV series
export const getOnTheAirTVSeries = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tv/on_the_air`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching on the air TV series:', error)
    return []
  }
}

// Get TV series details
export const getTVSeriesDetails = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching TV series details:', error)
    return null
  }
}

// Get TV series credits (cast and crew)
export const getTVSeriesCredits = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/credits`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching TV series credits:', error)
    return { cast: [], crew: [] }
  }
}

// Get TV series season details
export const getTVSeasonDetails = async (tvId, seasonNumber) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching TV season details:', error)
    return null
  }
}

// Get TV series episode details
export const getTVEpisodeDetails = async (tvId, seasonNumber, episodeNumber) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching TV episode details:', error)
    return null
  }
}

// Search TV series
export const searchTVSeries = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search/tv?query=${encodeURIComponent(query)}`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error searching TV series:', error)
    return []
  }
}

// Get TV genres
export const getTVGenres = async () => {
  try {
    const response = await fetch(`${BASE_URL}/genre/tv/list`, options)
    const data = await response.json()
    return data.genres
  } catch (error) {
    console.error('Error fetching TV genres:', error)
    return []
  }
}

// Discover TV series with filters
export const discoverTVSeries = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    
    const response = await fetch(`${BASE_URL}/discover/tv?${queryParams.toString()}`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error discovering TV series:', error)
    return []
  }
}

// ENHANCED MOVIE FUNCTIONS

// Discover movies with filters
export const discoverMovies = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams.toString()}`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error discovering movies:', error)
    return []
  }
}

// Get movie credits (cast and crew)
export const getMovieCredits = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching movie credits:', error)
    return { cast: [], crew: [] }
  }
}

// Get movie videos (trailers, teasers, etc.)
export const getMovieVideos = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching movie videos:', error)
    return []
  }
}

// Get TV series videos
export const getTVSeriesVideos = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/videos`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching TV series videos:', error)
    return []
  }
}

// Get similar movies
export const getSimilarMovies = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/similar`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching similar movies:', error)
    return []
  }
}

// Get similar TV series
export const getSimilarTVSeries = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/similar`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching similar TV series:', error)
    return []
  }
}

// Get movie recommendations
export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching movie recommendations:', error)
    return []
  }
}

// Get TV series recommendations
export const getTVSeriesRecommendations = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/recommendations`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching TV series recommendations:', error)
    return []
  }
}

// Multi search (movies, TV series, people)
export const multiSearch = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`, options)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error performing multi search:', error)
    return []
  }
}

// HELPER FUNCTIONS

// Helper function to format movie data for our components
export const formatMovieData = (movie) => {
  return {
    id: movie.id,
    title: movie.title,
    year: new Date(movie.release_date).getFullYear(),
    rating: movie.vote_average,
    image: getImageUrl(movie.poster_path),
    backdrop: getBackdropUrl(movie.backdrop_path),
    genre: movie.genre_ids || [],
    description: movie.overview,
    duration: movie.runtime ? `${movie.runtime}m` : 'N/A'
  }
}

// Helper function to format TV series data for our components
export const formatTVSeriesData = (tvSeries) => {
  return {
    id: tvSeries.id,
    name: tvSeries.name,
    title: tvSeries.name, // For compatibility with movie components
    year: new Date(tvSeries.first_air_date).getFullYear(),
    rating: tvSeries.vote_average,
    image: getImageUrl(tvSeries.poster_path),
    backdrop: getBackdropUrl(tvSeries.backdrop_path),
    genre: tvSeries.genre_ids || [],
    description: tvSeries.overview,
    duration: tvSeries.episode_run_time && tvSeries.episode_run_time.length > 0 
      ? `${tvSeries.episode_run_time[0]}m/ep` 
      : 'N/A',
    numberOfSeasons: tvSeries.number_of_seasons,
    numberOfEpisodes: tvSeries.number_of_episodes,
    status: tvSeries.status,
    firstAirDate: tvSeries.first_air_date,
    lastAirDate: tvSeries.last_air_date
  }
}

// Helper function to format credits data
export const formatCreditsData = (credits) => {
  return {
    cast: credits.cast?.map(person => ({
      id: person.id,
      name: person.name,
      character: person.character,
      profilePath: getImageUrl(person.profile_path, 'w185'),
      order: person.order
    })) || [],
    crew: credits.crew?.map(person => ({
      id: person.id,
      name: person.name,
      job: person.job,
      department: person.department,
      profilePath: getImageUrl(person.profile_path, 'w185')
    })) || []
  }
}
