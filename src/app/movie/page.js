// app/movie/[id]/page.js
import { generateMetadata } from "@/lib/generateMovieListMetadata";
import { Suspense } from "react";
import MoviePage from "./movie";

export { generateMetadata };


export default async function Page() {
  return( 
    <Suspense fallback={<div className="p-8 text-center text-white">Loading movies…</div>}>
      <MoviePage />
    </Suspense>
  )
}
// app/movies/page.tsx or app/movies/metadata.ts (if you're using dynamic metadata)
