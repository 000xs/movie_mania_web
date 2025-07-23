// app/movie/[id]/page.js
import { generateMetadata } from "@/lib/generateMovieMetadata";
import MoviePage from "./[id]";

export { generateMetadata }; 

export default async function Page({ params }) {
  const { id } = await params;
  return <MoviePage mId={id}   />;
}
