'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl } from '../lib/tmdb'

export default function MovieList({ movieId }) {
  const [suggestedMovies, setSuggestedMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSuggestedMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/movies/suggested?movieId=${movieId}`)
        const data = await response.json()
        if (!response.ok) {
          setError('Failed to load suggested movies')
          return
        }
        setSuggestedMovies(data.results || [])
      } catch (err) {
        console.error('Error fetching suggested movies:', err)
        setError('Failed to load suggested movies')
      } finally {
        setLoading(false)
      }
    }

    if (movieId) {
      fetchSuggestedMovies()
    }
  }, [movieId])

  if (loading) return <p>Loading suggested movies...</p>
  if (error) return <p>{error}</p>
  if (suggestedMovies.length === 0) return <p>No suggested movies found.</p>

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {suggestedMovies.map((movie) => (
        <Link
          key={movie._id || movie.id}
          href={`/movie/${movie._id || movie.id}`}
          className="block rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative w-full h-48">
            <Image
              src={movie.posterPath ? getImageUrl(movie.posterPath, 'w342') : '/placeholder.svg'}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <h3 className="mt-2 text-white font-semibold text-center">{movie.title}</h3>
        </Link>
      ))}
    </div>
  )
}
