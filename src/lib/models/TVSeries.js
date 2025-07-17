// // lib/models/TVSeries.js
// import mongoose from "mongoose";

// const tvSeriesSchema = new mongoose.Schema(
//   {
//     tvseriesId: { type: String, unique: true, required: true }, // Unique ID for the TV series, if different from tmdbId
//     name: { type: String, required: true },
//     overview: { type: String, required: true },
//     firstAirDate: { type: Date, required: true },
//     lastAirDate: { type: Date },
//     genres: [{ type: String }],
//     posterPath: { type: String },
//     backdropPath: { type: String },
//     voteAverage: { type: Number, default: 0 },
//     voteCount: { type: Number, default: 0 },
//     popularity: { type: Number, default: 0 },
//     adult: { type: Boolean, default: false },
//     originalLanguage: { type: String, default: "en" },
//     originalName: { type: String },
//     status: {
//       type: String,
//       enum: [
//         "Returning Series",
//         "Ended",
//         "Canceled",
//         "In Production",
//         "Planned",
//       ],
//       default: "Returning Series",
//     },
//     tagline: { type: String },
//     homepage: { type: String },
//     tmdbId: { type: Number }, // TMDb ID for reference
//     numberOfEpisodes: { type: Number, default: 0 },
//     numberOfSeasons: { type: Number, default: 0 },
//     episodeRunTime: [{ type: Number }],
//     inProduction: { type: Boolean, default: false },
//     type: { type: String },
//     downloads: {
//       type: [
//         {
//           quality: { type: String, required: true },
//           format: { type: String, required: true },
//           url: { type: String, required: true },
//         },
//       ],
//       default: null,
//     },
//     subtitles: [
//       {
//         language: String, // e.g., "English", "Sinhala"
//         url: String, // subtitle file (SRT, VTT, etc.)
//       },
//     ],
//     cast: [
//       {
//         name: String,
//         character: String,
//         profilePath: String,
//       },
//     ],
//     crew: [
//       {
//         name: String,
//         job: String,
//         department: String,
//         profilePath: String,
//       },
//     ],
//     networks: [
//       {
//         id: Number,
//         name: String,
//         logoPath: String,
//         originCountry: String,
//       },
//     ],
//     productionCompanies: [
//       {
//         name: String,
//         logoPath: String,
//         originCountry: String,
//       },
//     ],
//     productionCountries: [
//       {
//         name: String,
//         iso31661: String,
//       },
//     ],
//     spokenLanguages: [
//       {
//         name: String,
//         iso6391: String,
//       },
//     ],
//     seasons: [
//       {
//         airDate: Date,
//         episodeCount: Number,
//         name: String,
//         overview: String,
//         posterPath: String,
//         seasonNumber: Number,
//         episodes: [
//           {
//             episodeId: { type: String, unique: true, required: true },
//             name: { type: String },
//             overview: { type: String },
//             airDate: { type: Date },
//             episodeNumber: { type: Number },
//             seasonNumber: { type: Number },
//             stillPath: { type: String },
//             voteAverage: { type: Number },
//             voteCount: { type: Number },
//             runtime: { type: Number },
//             downloads: {
//               type: [
//                 {
//                   quality: { type: String, required: true },
//                   format: { type: String, required: true },
//                   url: { type: String, required: true },
//                 },
//               ],
//               default: null,
//             },
//             subtitles: [
//               {
//                 language: String,
//                 url: String,
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// // Clear any existing model to avoid schema conflicts
// if (mongoose.models.TVSeries) {
//   delete mongoose.models.TVSeries;
// }

// export default mongoose.model("TVSeries", tvSeriesSchema);

// lib/models/TVSeries.js
import mongoose from "mongoose";

const tvSeriesSchema = new mongoose.Schema(
  {
    tvseriesId: { type: String, unique: true, required: true }, // Unique ID for the TV series, if different from tmdbId
    name: { type: String, required: true },
    overview: { type: String, required: true },
    firstAirDate: { type: Date, required: true },
    lastAirDate: { type: Date },
    genres: [{ type: String }],
    posterPath: { type: String },
    backdropPath: { type: String },
    voteAverage: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    adult: { type: Boolean, default: false },
    originalLanguage: { type: String, default: "en" },
    originalName: { type: String },
    status: {
      type: String,
      enum: [
        "Returning Series",
        "Ended",
        "Canceled",
        "In Production",
        "Planned",
      ],
      default: "Returning Series",
    },
    tagline: { type: String },
    homepage: { type: String },
    tmdbId: { type: Number }, // TMDb ID for reference
    numberOfEpisodes: { type: Number, default: 0 },
    numberOfSeasons: { type: Number, default: 0 },
    episodeRunTime: [{ type: Number }],
    inProduction: { type: Boolean, default: false },
    type: { type: String },
    downloads: [
      {
        downloadType: {
          type: String,
          required: true,
          enum: ["DIRECT", "TELEGRAM", "DRIVE"],
        },
        videoType: {
          type: String,
          required: true,
        },
        quality: {
          type: String,
          required: true,
        },
        link: { type: String, required: true },
      },
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
    networks: [
      {
        id: Number,
        name: String,
        logoPath: String,
        originCountry: String,
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
    seasons: [
      {
        airDate: Date,
        episodeCount: Number,
        name: String,
        overview: String,
        posterPath: String,
        seasonNumber: Number,
        downloads: [
          {
            downloadType: {
              type: String,
              required: true,
              enum: ["DIRECT", "TELEGRAM", "DRIVE"],
            },
            videoType: {
              type: String,
              required: true,
            },
            quality: {
              type: String,
              required: true,
            },
            link: { type: String, required: true },
          },
        ],

        episodes: [
          {
            episodeId: { type: String, unique: true, required: true },
            name: { type: String },
            overview: { type: String },
            airDate: { type: Date },
            episodeNumber: { type: Number },
            seasonNumber: { type: Number },
            stillPath: { type: String },
            voteAverage: { type: Number },
            voteCount: { type: Number },
            runtime: { type: Number },
            downloads: [
              {
                downloadType: {
                  type: String,
                  required: true,
                  enum: ["DIRECT", "TELEGRAM", "DRIVE"],
                },
                videoType: {
                  type: String,
                  required: true,
                },
                quality: {
                  type: String,
                  required: true,
                },
                link: { type: String, required: true },
              },
            ],

            subtitles: [
              {
                language: String,
                url: String,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Clear any existing model to avoid schema conflicts
if (mongoose.models.TVSeries) {
  delete mongoose.models.TVSeries;
}

export default mongoose.model("TVSeries", tvSeriesSchema);
