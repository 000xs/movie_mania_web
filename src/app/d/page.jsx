'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Plus,
  Film,
  Tv,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Calendar,
  Clock,
  Star,
  Globe,
  Users,
  Download,
  Subtitles,
  Home,
  BarChart3,
  Settings,
  Database,
  Edit,
  Filter,
  ChevronDown,
  ChevronUp,
  Play,
  List,
  Grid,
  RefreshCw,
  ExternalLink,
  Upload,
  FileText,
  Monitor,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Server,
  HardDrive,
  Bell,
  User,
  Moon,
  Sun,
  Menu,
  MoreHorizontal,
  Copy,
  Share2,
  Target,
  Package,
  Tag,
  Bookmark,
  Heart,
  ThumbsUp,
  Folder,
  Archive,
  Trash,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  FilterX,
  SearchX,
  PlusCircle,
  MinusCircle,
  Import,
  Export,
  CloudDownload,
  CloudUpload
} from 'lucide-react';

export default function MovieManiaDashboard() {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [contentType, setContentType] = useState('movie');
  const [tmdbId, setTmdbId] = useState('');
  const [tmdbData, setTmdbData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalMovies: 0,
    totalTvShows: 0,
    totalEpisodes: 0,
    totalStorage: 0,
    recentlyAdded: [],
    popularContent: [],
    systemHealth: 'good'
  });

  // Content Management States
  const [contentList, setContentList] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // TV Series Episode Management
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesSeasons, setSeriesSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [episodeForm, setEpisodeForm] = useState({
    episodeNumber: '',
    title: '',
    overview: '',
    airDate: '',
    runtime: '',
    stillPath: '',
    voteAverage: 0,
    downloads: [],
    subtitles: [],
    watched: false
  });

  // Form Data States
  const [downloads, setDownloads] = useState([{ quality: '1080p', type: 'Web-DL', url: '', size: '' }]);
  const [subtitles, setSubtitles] = useState([{ language: 'English', url: '', format: 'SRT' }]);
  const [cast, setCast] = useState([{ name: '', character: '', profilePath: '' }]);
  const [crew, setCrew] = useState([{ name: '', job: '', department: '', profilePath: '' }]);
  const [manualData, setManualData] = useState({
    releaseDate: '',
    runtime: '',
    title: '',
    overview: '',
    genres: [],
    rating: '',
    status: 'Released'
  });

  // Advanced Form States
  const [productionCompanies, setProductionCompanies] = useState([{ name: '', logoPath: '', originCountry: '' }]);
  const [spokenLanguages, setSpokenLanguages] = useState([{ name: 'English', iso6391: 'en' }]);
  const [keywords, setKeywords] = useState([]);

  // Website Management States
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: 'Movie Mania',
    siteDescription: 'Your ultimate movie and TV series destination',
    logo: '',
    favicon: '',
    primaryColor: '#dc2626',
    secondaryColor: '#1f2937',
    featuredContent: [],
    maintenanceMode: false,
    allowRegistration: true,
    enableComments: true,
    enableRatings: true
  });

  // Load dashboard statistics
  useEffect(() => {
    loadDashboardStats();
    loadContentList();
    loadNotifications();
  }, []);

  // Filter content based on search and filters
  useEffect(() => {
    let filtered = contentList;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.overview || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.genres || []).some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        if (filterType === 'movie') return !item.numberOfSeasons;
        if (filterType === 'tv') return item.numberOfSeasons;
        return true;
      });
    }

    // Genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter(item =>
        (item.genres || []).includes(filterGenre)
      );
    }

    // Year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(item => {
        const year = new Date(item.releaseDate || item.firstAirDate || 0).getFullYear();
        return year.toString() === filterYear;
      });
    }

    // Rating filter
    if (filterRating !== 'all') {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter(item => (item.voteAverage || 0) >= minRating);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'releaseDate' || sortBy === 'firstAirDate' || sortBy === 'createdAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    setFilteredContent(filtered);
  }, [contentList, searchQuery, filterType, filterGenre, filterYear, filterRating, sortBy, sortOrder]);

  // TMDb data fetching
  useEffect(() => {
    if (!tmdbId || tmdbId.length < 1) {
      setTmdbData(null);
      return;
    }

    const fetchTMDbData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${contentType}/${tmdbId}?language=en-US&append_to_response=credits,keywords,videos,images`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`TMDb API error: ${response.status}`);
        }

        const data = await response.json();
        setTmdbData(data);

        // Auto-populate form data
        const releaseDate = data.release_date || data.first_air_date || '';
        const runtime = data.runtime || (data.episode_run_time?.[0] ?? '');
        const title = data.title || data.name || '';

        setManualData({
          releaseDate,
          runtime: runtime.toString(),
          title,
          overview: data.overview || '',
          genres: data.genres?.map(g => g.name) || [],
          rating: data.vote_average?.toString() || '',
          status: data.status || 'Released'
        });

        // Auto-populate cast and crew
        if (data.credits) {
          setCast(data.credits.cast?.slice(0, 10).map(person => ({
            name: person.name,
            character: person.character || '',
            profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : ''
          })) || [{ name: '', character: '', profilePath: '' }]);

          setCrew(data.credits.crew?.slice(0, 5).map(person => ({
            name: person.name,
            job: person.job || '',
            department: person.department || '',
            profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : ''
          })) || [{ name: '', job: '', department: '', profilePath: '' }]);
        }

        // Auto-populate keywords
        if (data.keywords) {
          setKeywords(data.keywords.keywords?.map(k => k.name) || data.keywords.results?.map(k => k.name) || []);
        }

        // Auto-populate production companies
        if (data.production_companies) {
          setProductionCompanies(data.production_companies.map(company => ({
            name: company.name,
            logoPath: company.logo_path ? `https://image.tmdb.org/t/p/w92${company.logo_path}` : '',
            originCountry: company.origin_country || ''
          })));
        }

        // Auto-populate spoken languages
        if (data.spoken_languages) {
          setSpokenLanguages(data.spoken_languages.map(lang => ({
            name: lang.english_name || lang.name,
            iso6391: lang.iso_639_1
          })));
        }

      } catch (err) {
        setError(`Failed to fetch TMDb data: ${err.message}`);
        setTmdbData(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTMDbData, 500);
    return () => clearTimeout(debounceTimer);
  }, [tmdbId, contentType]);

  // Dashboard Statistics
  const loadDashboardStats = async () => {
    try {
      const [moviesRes, tvRes] = await Promise.all([
        fetch('/api/movies?limit=100'),
        fetch('/api/tv?limit=100')
      ]);

      const moviesData = await moviesRes.json();
      const tvData = await tvRes.json();

      // Calculate total episodes for TV shows
      const totalEpisodes = (tvData.results || []).reduce((sum, show) =>
        sum + (show.numberOfEpisodes || 0), 0
      );

      // Calculate estimated storage (mock calculation)
      const totalStorage = ((moviesData.results || []).length * 2.5 +
                           (tvData.results || []).length * 15) * 1024; // MB

      // Get recent content
      const allContent = [
        ...(moviesData.results || []).map(item => ({ ...item, type: 'movie' })),
        ...(tvData.results || []).map(item => ({ ...item, type: 'tv' }))
      ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      // Get popular content (by vote average)
      const popularContent = allContent
        .filter(item => item.voteAverage > 7)
        .sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))
        .slice(0, 5);

      setDashboardStats({
        totalMovies: moviesData.total_results || 0,
        totalTvShows: tvData.total_results || 0,
        totalEpisodes,
        totalStorage,
        recentlyAdded: allContent.slice(0, 10),
        popularContent,
        systemHealth: 'good'
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      addNotification('Failed to load dashboard statistics', 'error');
    }
  };

  // Load content list for management
  const loadContentList = async () => {
    setLoading(true);
    try {
      const [moviesRes, tvRes] = await Promise.all([
        fetch('/api/movies?limit=1000'),
        fetch('/api/tv?limit=1000')
      ]);

      const moviesData = await moviesRes.json();
      const tvData = await tvRes.json();

      const allContent = [
        ...(moviesData.results || []).map(item => ({ ...item, type: 'movie' })),
        ...(tvData.results || []).map(item => ({ ...item, type: 'tv' }))
      ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setContentList(allContent);
    } catch (err) {
      setError('Failed to load content list');
      addNotification('Failed to load content list', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = () => {
    // Mock notifications - in real app, fetch from API
    setNotifications([
      {
        id: 1,
        type: 'info',
        title: 'System Update',
        message: 'Dashboard updated to version 2.0',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'success',
        title: 'Backup Complete',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      }
    ]);
  };

  // Add notification
  const addNotification = (message, type = 'info', title = '') => {
    const notification = {
      id: Date.now(),
      type,
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info'),
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Load TV series seasons and episodes
  const loadSeriesData = async (seriesId) => {
    setLoading(true);
    try {
      const seriesRes = await fetch(`/api/tv/${seriesId}`);
      const seriesData = await seriesRes.json();

      if (seriesData.results && seriesData.results[0]) {
        setSelectedSeries(seriesData.results[0]);

        // Generate seasons based on numberOfSeasons
        const seasons = [];
        for (let i = 1; i <= (seriesData.results[0].numberOfSeasons || 1); i++) {
          seasons.push({
            seasonNumber: i,
            name: `Season ${i}`,
            episodeCount: 0,
            episodes: []
          });
        }
        setSeriesSeasons(seasons);
      }
    } catch (err) {
      setError('Failed to load series data');
      addNotification('Failed to load series data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Form Handlers
  const handleFieldChange = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddField = (setter, structure) => {
    setter(prev => [...prev, { ...structure }]);
  };

  const handleRemoveField = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=en-US`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      setSearchResults(data.results?.slice(0, 10) || []);
    } catch (err) {
      setError('Search failed');
      addNotification('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete content
  const handleDelete = async (item) => {
    setLoading(true);
    try {
      const endpoint = item.type === 'movie' ? `/api/movies/${item._id}` : `/api/tv/${item._id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setSuccess(`${item.type === 'movie' ? 'Movie' : 'TV Show'} deleted successfully`);
      addNotification(`${item.type === 'movie' ? 'Movie' : 'TV Show'} deleted successfully`, 'success');
      loadContentList();
      loadDashboardStats();
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      await Promise.all(
        selectedItems.map(async (item) => {
          const endpoint = item.type === 'movie' ? `/api/movies/${item._id}` : `/api/tv/${item._id}`;
          return fetch(endpoint, { method: 'DELETE' });
        })
      );

      setSuccess(`${selectedItems.length} items deleted successfully`);
      addNotification(`${selectedItems.length} items deleted successfully`, 'success');
      setSelectedItems([]);
      loadContentList();
      loadDashboardStats();
    } catch (err) {
      setError('Failed to delete some items');
      addNotification('Failed to delete some items', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!tmdbData) {
      setError('Please fetch TMDb data first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = contentType === 'movie' ? '/api/movies' : '/api/tv';
      const transformedData = {
        // Common fields
        title: manualData.title || tmdbData.title || tmdbData.name,
        overview: manualData.overview || tmdbData.overview,
        releaseDate: manualData.releaseDate ? new Date(manualData.releaseDate) : null,
        runtime: Number(manualData.runtime) || 0,
        genres: tmdbData.genres?.map(g => g.name) || [],
        posterPath: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : '',
        backdropPath: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/w780${tmdbData.backdrop_path}` : '',
        voteAverage: tmdbData.vote_average || 0,
        voteCount: tmdbData.vote_count || 0,
        popularity: tmdbData.popularity || 0,
        adult: tmdbData.adult || false,
        originalLanguage: tmdbData.original_language || '',
        originalTitle: tmdbData.original_title || tmdbData.original_name || '',
        status: tmdbData.status || '',
        tagline: tmdbData.tagline || '',
        homepage: tmdbData.homepage || '',
        imdbId: tmdbData.imdb_id || '',
        tmdbId: tmdbData.id,

        // Production details
        productionCompanies: (tmdbData.production_companies || []).map(c => ({
          name: c.name,
          logoPath: c.logo_path ? `https://image.tmdb.org/t/p/w92${c.logo_path}` : null,
          originCountry: c.origin_country,
        })),
        productionCountries: (tmdbData.production_countries || []).map(c => ({
          name: c.name,
          iso31661: c.iso_3166_1,
        })),
        spokenLanguages: (tmdbData.spoken_languages || []).map(l => ({
          name: l.name,
          iso6391: l.iso_639_1,
        })),

        // Additional data
        cast: cast.filter(c => c.name.trim()),
        crew: crew.filter(c => c.name.trim()),
        downloads: downloads
          .filter(d => d.url && d.url.trim())
          .map(d => ({
            quality: d.quality || '',
            type: d.type || '',
            url: d.url,
            size: d.size || '',
          })),

        subtitles: subtitles.filter(s => s.url && s.url.trim()),
        type: contentType,
      };

      // TV-specific fields
      if (contentType === 'tv') {
        transformedData.name = transformedData.title;
        transformedData.firstAirDate = transformedData.releaseDate;
        transformedData.numberOfSeasons = tmdbData.number_of_seasons || 0;
        transformedData.numberOfEpisodes = tmdbData.number_of_episodes || 0;
        transformedData.episodeRunTime = tmdbData.episode_run_time || [];
        transformedData.inProduction = tmdbData.in_production || false;
        transformedData.lastAirDate = tmdbData.last_air_date ? new Date(tmdbData.last_air_date) : null;
        transformedData.networks = tmdbData.networks || [];
        transformedData.originCountry = tmdbData.origin_country || [];
      } else {
        // Movie-specific fields
        transformedData.budget = tmdbData.budget || 0;
        transformedData.revenue = tmdbData.revenue || 0;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save');
      }

      setSuccess(`${contentType === 'movie' ? 'Movie' : 'TV Show'} saved successfully!`);
      addNotification(`${contentType === 'movie' ? 'Movie' : 'TV Show'} saved successfully!`, 'success');

      // Reset form
      setTimeout(() => {
        setTmdbId('');
        setTmdbData(null);
        setDownloads([{ quality: '1080p', type: 'Web-DL', url: '', size: '' }]);
        setSubtitles([{ language: 'English', url: '', format: 'SRT' }]);
        setCast([{ name: '', character: '', profilePath: '' }]);
        setCrew([{ name: '', job: '', department: '', profilePath: '' }]);
        setManualData({ releaseDate: '', runtime: '', title: '', overview: '', genres: [], rating: '', status: 'Released' });
        loadDashboardStats();
        loadContentList();
      }, 2000);

    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get unique genres from content list
  const getUniqueGenres = () => {
    const genres = new Set();
    contentList.forEach(item => {
      (item.genres || []).forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  };

  // Get unique years from content list
  const getUniqueYears = () => {
    const years = new Set();
    contentList.forEach(item => {
      const year = new Date(item.releaseDate || item.firstAirDate || 0).getFullYear();
      if (year > 1900) years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredContent.slice(startIndex, endIndex);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gradient-to-r from-red-900 to-red-700' : 'bg-gradient-to-r from-red-600 to-red-500'} shadow-lg sticky top-0 z-50`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl">
                  M
                </div>
                <span className="text-2xl font-bold">Movie Mania Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-red-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} z-50`}>
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                      ) : (
                        notifications.map(notification => (
                          <div key={notification.id} className={`p-4 border-b border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-900/20' : ''}`}>
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'error' ? 'bg-red-500' :
                                notification.type === 'success' ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="font-medium">{notification.title}</h4>
                                <p className="text-sm text-gray-400">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white z-40 transition-all duration-200 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Image src="/vercel.svg" alt="Logo" width={32} height={32} />
              <span className="text-xl font-bold">Movie Mania</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors lg:hidden"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <nav>
          <ul className="space-y-1">
            <li>
              <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span>Overview</span>}
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <Film className="w-5 h-5" />
                {!sidebarCollapsed && <span>Movies</span>}
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <Tv className="w-5 h-5" />
                {!sidebarCollapsed && <span>TV Shows</span>}
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <Save className="w-5 h-5" />
                {!sidebarCollapsed && <span>Saved</span>}
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-
