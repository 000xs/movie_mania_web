import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar } from 'lucide-react';

const TVSeriesCard = ({ series }) => {
  const formatGenres = (genres) => {
    if (!genres || !Array.isArray(genres)) {
      return 'N/A';
    }
    return genres.map(genre => genre.name).join(', ');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <Link href={`/tv/${series.id}`}>
        <div className="relative w-full h-64">
          <Image
            src={series.posterPath || "/placeholder.svg"}
            alt={series.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-white mb-2 truncate">{series.name}</h3>
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span>{series.voteAverage ? series.voteAverage.toFixed(1) : 'N/A'}</span>
            <Calendar className="w-4 h-4 ml-4 mr-1 text-gray-400" />
            <span>{series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : 'N/A'}</span>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-3">{series.overview}</p>
          <p className="text-gray-500 text-xs">Genres: {formatGenres(series.genres)}</p>
        </div>
      </Link>
      <div className="p-4 border-t border-gray-700 flex justify-between">
        <Link href={`/tv/${series.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          View Details
        </Link>
        <Link href={`/dashboard/edit-tv/${series.id}`} className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
          Edit
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to delete this TV series?")) {
              fetch(`/api/tv/${series.tvseriesId}`, { method: "DELETE" })
                .then(res => {
                  if (res.ok) {
                    window.location.reload(); // Reload to reflect changes
                  } else {
                    alert("Failed to delete TV series.");
                  }
                })
                .catch(error => console.error("Error deleting TV series:", error));
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

export default TVSeriesCard;
