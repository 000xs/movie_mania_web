import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const formatGenres = (genres) => {
    if (!genres || !Array.isArray(genres)) {
      return 'N/A';
    }
    return genres.map(genre => genre.name).join(', ');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl" role="article" aria-label={`Movie card for ${movie.title}`}>
      <Link href={`/movie/${movie.movieId}`}>
        <div className="relative w-full h-64" style={{ maxHeight: '300px' }}>
          <Image
            src={movie.posterPath || "/placeholder.svg"}
            alt={movie.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            priority
          />
        </div>
        <div className="p-4" aria-labelledby={`movie-title-${movie.movieId}`}>
          <h3 id={`movie-title-${movie.movieId}`} className="text-xl font-semibold text-white mb-2 truncate">{movie.title}</h3>
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span>{movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A'}</span>
            <Calendar className="w-4 h-4 ml-4 mr-1 text-gray-400" />
            <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}</span>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-3">{movie.overview}</p>
          <p className="text-gray-500 text-xs">Genres: {formatGenres(movie.genres)}</p>
        </div>
      </Link>
      <div className="p-4 border-t border-gray-700 flex justify-between">
        <Link href={`/movie/${movie.movieId}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View Details
        </Link>
        <Link href={`/dashboard/edit-movie/${movie.movieId}`} className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
          Edit
        </Link>
        <button
          aria-label={`Delete ${movie.title}`}
          onClick={(e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to delete this movie?")) {
              fetch(`/api/movies/${movie.movieId}`, { method: "DELETE" })
                .then(res => {
                  if (res.ok) {
                    window.location.reload(); // Reload to reflect changes
                  } else {
                    alert("Failed to delete movie.");
                  }
                })
                .catch(error => console.error("Error deleting movie:", error));
            }
          }}
          className="text-red-500 hover:text-red-400 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
