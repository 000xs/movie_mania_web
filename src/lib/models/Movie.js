import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      unique: true,
    },
    title: { type: String },
    overview: { type: String },
    releaseDate: { type: Date },
    runtime: { type: Number },
    genres: [{ type: String }],
    posterPath: { type: String },
    backdropPath: { type: String },
    voteAverage: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    adult: { type: Boolean, default: false },
    originalLanguage: { type: String, default: "en" },
    originalTitle: { type: String },
    budget: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Released", "In Production", "Post Production", "Planned"],
      default: "Released",
    },
    tagline: { type: String },
    homepage: { type: String },
    imdbId: { type: String },
    tmdbId: { type: Number }, // TMDb ID for reference
    downloads: [
      {
        downloadType: {
          type: String,
          required: true,
          enum: ['DIRECT', 'TELEGRAM', 'DRIVE']
        },
        videoType: {
          type: String,
          required: true
        },
        quality: {
          type: String,
          required: true
        },
        link:{ type: String, required: true },
          
      }
    ],

    subtitles: [
      {
        language: String, // e.g., "English", "Sinhala"
        url: String, // subtitle file (SRT, VTT, etc.)
      },
    ],

    cast: [
      {
        name: String,
        character: String,
        profilePath: String,
      },
    ],
    crew: [
      {
        name: String,
        job: String,
        department: String,
        profilePath: String,
      },
    ],
    productionCompanies: [
      {
        name: String,
        logoPath: String,
        originCountry: String,
      },
    ],
    productionCountries: [
      {
        name: String,
        iso31661: String,
      },
    ],
    spokenLanguages: [
      {
        name: String,
        iso6391: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Clear any existing model to avoid schema conflicts
if (mongoose.models.Movie) {
  delete mongoose.models.Movie;
}

export default mongoose.model("Movie", movieSchema);
