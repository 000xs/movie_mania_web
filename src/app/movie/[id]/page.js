// app/movie/[id]/page.js
import { generateMetadata } from "@/lib/generateMovieMetadata";
import MoviePage from "./[id]";

export { generateMetadata }; // ✅ server-only export

export default async function Page({ params }) {
  return <MoviePage mId={params.id}   />;
}
